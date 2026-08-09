const {Service} = require('egg')

class InfoService extends Service {
  async getInfo() {
    let height = this.app.blockchainInfo.tip.height
    let stakeWeight = JSON.parse(await this.app.redis.hget(this.app.name, 'stakeweight')) || 0
    let feeRate = JSON.parse(await this.app.redis.hget(this.app.name, 'feerate')).find(item => item.blocks === 10).feeRate || 0.004
    let dgpInfo = JSON.parse(await this.app.redis.hget(this.app.name, 'dgpinfo')) || {}
    let supply = await this.getTotalSupply()
    return {
      height,
      supply,
      ...this.app.chain.name === 'mainnet' ? {circulatingSupply: await this.getCirculatingSupply(supply)} : {},
      netStakeWeight: Math.round(stakeWeight),
      feeRate,
      dgpInfo
    }
  }

  async getTotalSupply() {
    let cachedSupply = await this.getCachedNodeSupply()
    if (cachedSupply != null) {
      return cachedSupply
    }

    try {
      return await this.updateNodeSupplyCache()
    } catch (err) {
      this.ctx.logger.warn('[supply] failed to refresh node moneysupply: %s', err.message)
      let staleSupply = await this.getCachedNodeSupply({allowStale: true})
      if (staleSupply != null) {
        return staleSupply
      }
      return this.getEstimatedTotalSupply()
    }
  }

  async getCachedNodeSupply({allowStale = false} = {}) {
    let supply = JSON.parse(await this.app.redis.hget(this.app.name, 'supply'))
    let updatedAt = Number(await this.app.redis.hget(this.app.name, 'supply-updated-at'))
    if (!Number.isFinite(supply) || !Number.isFinite(updatedAt)) {
      return null
    }
    if (allowStale || Date.now() - updatedAt < this.app.config.zeroscaninfo.supplyCacheTtl) {
      return supply
    }
    return null
  }

  async updateNodeSupplyCache({force = false} = {}) {
    if (!force && await this.isSupplyRefreshThrottled()) {
      let staleSupply = await this.getCachedNodeSupply({allowStale: true})
      if (staleSupply != null) {
        return staleSupply
      }
      throw new Error('node supply refresh is throttled')
    }

    await this.app.redis.hset(this.app.name, 'supply-fetch-attempted-at', Date.now())
    let supply = await this.getNodeMoneySupply()
    await this.app.redis.hset(this.app.name, 'supply', JSON.stringify(supply))
    await this.app.redis.hset(this.app.name, 'supply-updated-at', Date.now())
    return supply
  }

  async isSupplyRefreshThrottled() {
    let attemptedAt = Number(await this.app.redis.hget(this.app.name, 'supply-fetch-attempted-at'))
    return Number.isFinite(attemptedAt)
      && Date.now() - attemptedAt < this.app.config.zeroscaninfo.supplyRetryInterval
  }

  async getNodeMoneySupply() {
    let client = new this.app.zeroscaninfo.rpc(this.app.config.zeroscaninfo.rpc)
    let info = await client.getblockchaininfo()
    let supply = Number(info.moneysupply)
    if (!Number.isFinite(supply)) {
      throw new Error('node getblockchaininfo did not return numeric moneysupply')
    }
    return supply
  }

  getEstimatedTotalSupply() {
    let height = this.app.blockchainInfo.tip.height
    if (height <= this.app.chain.lastPoWBlockHeight) {
      return height * 20000
    } else {
      let supply = 1e8
      let reward = 4
      let interval = 985500
      let stakeHeight = height - this.app.chain.lastPoWBlockHeight
      let halvings = 0
      while (halvings < 7 && stakeHeight > interval) {
        supply += interval * reward / (1 << halvings++)
        stakeHeight -= interval
      }
      supply += stakeHeight * reward / (1 << halvings)
      return supply
    }
  }

  getTotalMaxSupply() {
    return 1e8 + 985500 * 4 * (1 - 1 / 2 ** 7) / (1 - 1 / 2)
  }

  async getCirculatingSupply(totalSupply = null) {
    totalSupply = totalSupply == null ? await this.getTotalSupply() : totalSupply
    if (this.app.chain.name === 'mainnet') {
      return totalSupply - 575e4
    } else {
      return totalSupply
    }
  }

  async getStakeWeight() {
    const {Header} = this.ctx.model
    const {gte: $gte} = this.app.Sequelize.Op
    let height = await Header.aggregate('height', 'max', {transaction: this.ctx.state.transaction})
    let list = await Header.findAll({
      where: {height: {[$gte]: height - 500}},
      attributes: ['timestamp', 'bits'],
      order: [['height', 'ASC']],
      transaction: this.ctx.state.transaction
    })
    let interval = list[list.length - 1].timestamp - list[0].timestamp
    let sum = list.slice(1)
      .map(x => x.difficulty)
      .reduce((x, y) => x + y)
    return sum * 2 ** 32 * 16 / interval
  }

  async getFeeRates() {
    let client = new this.app.zeroscaninfo.rpc(this.app.config.zeroscaninfo.rpc)
    let results = await Promise.all([2, 4, 6, 10, 12, 24].map(blocks => client.estimatesmartfee(blocks)))
    return [
      {blocks: 2, feeRate: results[0].feerate || 0.004},
      {blocks: 4, feeRate: results[1].feerate || 0.004},
      {blocks: 6, feeRate: results[2].feerate || 0.004},
      {blocks: 10, feeRate: results[3].feerate || 0.004},
      {blocks: 12, feeRate: results[4].feerate || 0.004},
      {blocks: 24, feeRate: results[5].feerate || 0.004}
    ]
  }

  async getDGPInfo() {
    let client = new this.app.zeroscaninfo.rpc(this.app.config.zeroscaninfo.rpc)
    let info = await client.getdgpinfo()
    return {
      maxBlockSize: info.maxblocksize,
      minGasPrice: info.mingasprice,
      blockGasLimit: info.blockgaslimit
    }
  }
}

module.exports = InfoService
