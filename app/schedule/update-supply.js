const {Subscription} = require('egg')

class UpdateSupplySubscription extends Subscription {
  static get schedule() {
    return {
      cron: '0 0 * * *',
      type: 'worker'
    }
  }

  async subscribe() {
    try {
      let supply = await this.ctx.service.info.updateNodeSupplyCache({force: true})
      if (supply != null) {
        this.app.io.of('/').to('blockchain')
          .emit('supply', supply)
      }
    } catch (err) {
      this.ctx.logger.warn('[supply] scheduled refresh failed: %s', err.message)
    }
  }
}

module.exports = UpdateSupplySubscription
