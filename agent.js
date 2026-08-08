const SocketClient = require('socket.io-client')

module.exports = function(agent) {
  let tip = null

  function normalizeEndpoint(endpoint) {
    return String(endpoint || '').replace(/\/+$/, '')
  }

  function createSocketClient(endpoint) {
    return SocketClient(normalizeEndpoint(endpoint), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000
    })
  }

  function attachBlockchainEvents(io) {
    io.on('tip', newTip => {
      tip = newTip
      agent.messenger.sendToApp('block-tip', tip)
      agent.messenger.sendRandom('socket/block-tip', tip)
    })
    io.on('block', block => {
      tip = block
      agent.messenger.sendToApp('new-block', block)
      agent.messenger.sendRandom('update-stakeweight')
      agent.messenger.sendRandom('update-dgpinfo')
      agent.messenger.sendRandom('socket/block-tip', block)
    })
    io.on('reorg', block => {
      tip = block
      agent.messenger.sendToApp('reorg-to-block', block)
      agent.messenger.sendRandom('socket/reorg/block-tip', block)
    })
    io.on('mempool-transaction', id => {
      if (id) {
        agent.messenger.sendRandom('socket/mempool-transaction', id)
      }
    })
  }

  agent.messenger.on('egg-ready', () => {
    const endpoints = agent.config.zeroscaninfo.endpoints &&
      agent.config.zeroscaninfo.endpoints.length
      ? agent.config.zeroscaninfo.endpoints
      : [`http://localhost:${agent.config.zeroscaninfo.port}`]

    for (const endpoint of endpoints) {
      attachBlockchainEvents(createSocketClient(endpoint))
    }
  })

  let lastTipHash = Buffer.alloc(0)
  function updateStatistics() {
    if (tip && Buffer.compare(lastTipHash, tip.hash) !== 0) {
      agent.messenger.sendRandom('update-richlist')
      agent.messenger.sendRandom('update-qrc20-statistics')
      agent.messenger.sendRandom('update-daily-transactions')
      agent.messenger.sendRandom('update-block-interval')
      agent.messenger.sendRandom('update-address-growth')
      lastTipHash = tip.hash
    }
  }

  setInterval(updateStatistics, 2 * 60 * 1000).unref()

  agent.messenger.on('blockchain-info', () => {
    agent.messenger.sendToApp('blockchain-info', {tip})
  })

  agent.messenger.on('egg-ready', () => {
    let interval = setInterval(() => {
      if (tip) {
        agent.messenger.sendToApp('blockchain-info', {tip})
        clearInterval(interval)
        updateStatistics()
      }
    }, 0)
    agent.messenger.sendRandom('update-stakeweight')
    agent.messenger.sendRandom('update-feerate')
    agent.messenger.sendRandom('update-dgpinfo')
  })
}
