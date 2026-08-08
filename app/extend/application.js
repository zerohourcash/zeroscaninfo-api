const path = require('path')

const CHAIN = Symbol('zhcash.chain')

module.exports = {
  get chain() {
    this[CHAIN] = this[CHAIN] || this.zeroscaninfo.lib.Chain.get(this.config.zhcash.chain)
    return this[CHAIN]
  },
  get zeroscaninfo() {
    return {
      lib: require(path.resolve(this.config.zeroscaninfo.path, 'lib')),
      rpc: require(path.resolve(this.config.zeroscaninfo.path, 'rpc'))
    }
  }
}
