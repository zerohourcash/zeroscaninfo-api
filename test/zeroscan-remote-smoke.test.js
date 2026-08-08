const assert = require('assert')

const endpoints = [
  process.env.ZEROSCANINFO_PRIMARY || 'https://ws.zeroscan.st',
  process.env.ZEROSCANINFO_SECONDARY || 'https://ws.zeroscan.io'
]

const checks = [
  {
    path: '/info',
    validate: body => {
      assert(Number.isInteger(body.height), 'height must be an integer')
      assert(Number.isFinite(body.supply), 'supply must be numeric')
      assert(Number.isFinite(body.circulatingSupply), 'circulatingSupply must be numeric')
    }
  },
  {
    path: '/supply',
    validate: body => assert(Number.isFinite(Number(body)), 'supply endpoint must be numeric')
  },
  {
    path: '/total-max-supply',
    validate: body => assert(Number.isFinite(Number(body)), 'total-max-supply endpoint must be numeric')
  },
  {
    path: '/circulating-supply',
    validate: body => assert(Number.isFinite(Number(body)), 'circulating-supply endpoint must be numeric')
  },
  {
    path: '/feerates',
    validate: body => {
      assert(Array.isArray(body), 'feerates must be an array')
      assert(body.length > 0, 'feerates must not be empty')
    }
  },
  {
    path: '/recent-blocks',
    validate: body => {
      assert(Array.isArray(body), 'recent-blocks must be an array')
      assert(body.length > 0, 'recent-blocks must not be empty')
    }
  },
  {
    path: '/recent-txs',
    validate: body => assert(Array.isArray(body), 'recent-txs must be an array')
  }
]

async function requestJSON(base, path) {
  const response = await fetch(`${base.replace(/\/+$/, '')}${path}`)
  assert.strictEqual(response.status, 200, `${base}${path} returned HTTP ${response.status}`)
  return response.json()
}

async function main() {
  for (const base of endpoints) {
    for (const check of checks) {
      const body = await requestJSON(base, check.path)
      check.validate(body)
    }
  }
  console.log('zeroscan remote smoke tests passed')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
