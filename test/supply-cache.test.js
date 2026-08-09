const assert = require('assert')

const InfoService = require('../app/service/info')

function createRedis() {
  const data = new Map()
  return {
    async hget(hash, key) {
      return data.get(`${hash}:${key}`) || null
    },
    async hset(hash, key, value) {
      data.set(`${hash}:${key}`, String(value))
    },
    async setSupply(value, updatedAt) {
      await this.hset('zeroscaninfo-api', 'supply', JSON.stringify(value))
      await this.hset('zeroscaninfo-api', 'supply-updated-at', updatedAt)
    }
  }
}

function createService({rpcSupply = 9317348000, rpcFails = false} = {}) {
  let rpcCalls = 0
  const redis = createRedis()
  const app = {
    name: 'zeroscaninfo-api',
    redis,
    config: {
      zeroscaninfo: {
        rpc: {},
        supplyCacheTtl: 24 * 60 * 60 * 1000,
        supplyRetryInterval: 10 * 60 * 1000
      }
    },
    zeroscaninfo: {
      rpc: class {
        async getblockchaininfo() {
          rpcCalls++
          if (rpcFails) {
            throw new Error('rpc down')
          }
          return {moneysupply: rpcSupply}
        }
      }
    },
    blockchainInfo: {
      tip: {height: 1671685}
    },
    chain: {
      name: 'mainnet',
      lastPoWBlockHeight: 5000
    }
  }
  const service = Object.create(InfoService.prototype)
  service.app = app
  service.ctx = {
    logger: {
      warn() {}
    }
  }
  return {
    service,
    redis,
    get rpcCalls() {
      return rpcCalls
    }
  }
}

async function main() {
  {
    const env = createService()
    assert.strictEqual(await env.service.getTotalSupply(), 9317348000)
    assert.strictEqual(env.rpcCalls, 1)
    assert.strictEqual(await env.service.getTotalSupply(), 9317348000)
    assert.strictEqual(env.rpcCalls, 1, 'fresh cached supply must not call node again')
  }

  {
    const env = createService({rpcSupply: 42})
    await env.redis.setSupply(100, Date.now() - 25 * 60 * 60 * 1000)
    assert.strictEqual(await env.service.getTotalSupply(), 42)
    assert.strictEqual(env.rpcCalls, 1, 'stale cached supply must refresh from node')
  }

  {
    const env = createService({rpcFails: true})
    await env.redis.setSupply(100, Date.now() - 25 * 60 * 60 * 1000)
    assert.strictEqual(await env.service.getTotalSupply(), 100)
    assert.strictEqual(env.rpcCalls, 1, 'failed refresh should return stale supply')
  }

  {
    const env = createService({rpcFails: true})
    await env.redis.hset('zeroscaninfo-api', 'supply-fetch-attempted-at', Date.now())
    await env.service.getTotalSupply()
    assert.strictEqual(env.rpcCalls, 0, 'throttled refresh without cache must not call node')
  }

  console.log('supply-cache tests passed')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
