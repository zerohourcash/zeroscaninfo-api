const assert = require('assert')

const endpoints = [
  process.env.ZEROSCANINFO_PRIMARY || 'https://ws.zeroscan.st',
  process.env.ZEROSCANINFO_SECONDARY || 'https://ws.zeroscan.io'
]

const zhcExampleAddress = 'ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi'
const okTokenContract = 'e66c1aeba394ccda63c7644d68b4c771ef6548d9'

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
  },
  {
    path: `/address/${zhcExampleAddress}`,
    validate: body => {
      assert.strictEqual(typeof body.balance, 'string', 'address balance must be a string')
      assert(Array.isArray(body.zrc20Balances), 'address must expose zrc20Balances')
      assert(body.zrc20Balances.length > 0, 'example address must include token balances')
    }
  },
  {
    path: `/address/${zhcExampleAddress}/balance`,
    validate: body => assert(Number.isFinite(Number(body)), 'address balance endpoint must be numeric')
  },
  {
    path: `/address/${zhcExampleAddress}/zrc20-balance/${okTokenContract}`,
    validate: body => {
      assert.strictEqual(body.name, 'OK v.1.1', 'OK token name mismatch')
      assert.strictEqual(body.symbol, 'Ok', 'OK token symbol mismatch')
      assert.strictEqual(body.decimals, 8, 'OK token decimals mismatch')
      assert(Number.isFinite(Number(body.balance)), 'OK token balance must be numeric')
    }
  },
  {
    path: `/zrc20/${okTokenContract}/txs?limit=5&offset=0`,
    validate: body => {
      assert(Number.isInteger(body.totalCount), 'OK token tx totalCount must be an integer')
      assert(Array.isArray(body.transactions), 'OK token transactions must be an array')
      assert(body.transactions.length > 0, 'OK token transactions must not be empty')
    }
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
