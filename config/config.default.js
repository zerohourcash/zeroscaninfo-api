const path = require('path')
const Redis = require('ioredis')

const redisConfig = {
  host: 'localhost',
  port: 6379,
  password: '',
  db: 0
}

exports.keys = 'zeroscaninfo-api'

exports.security = {
  csrf: {enable: false}
}

exports.middleware = ['ratelimit']

exports.redis = {
  client: redisConfig
}

exports.ratelimit = {
  db: new Redis(redisConfig),
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total',
  },
  disableHeader: false,
  errorMessage: 'Rate Limit Exceeded',
  duration: 10 * 60 * 1000,
  max: 10 * 60
}

exports.io = {
  redis: {
    ...redisConfig,
    key: 'zeroscaninfo-api-socket.io'
  },
  namespace: {
    '/': {connectionMiddleware: ['connection']}
  }
}

exports.sequelize = {
  dialect: 'mysql',
  database: process.env.ZEROSCANINFO_MYSQL_DATABASE || 'zhcash_mainnet',
  host: 'localhost',
  port: 3306,
  username: process.env.ZEROSCANINFO_MYSQL_USER || 'zhcash',
  password: process.env.ZEROSCANINFO_MYSQL_PASSWORD || ''
}

exports.zhcash = {
  chain: 'mainnet'
}

exports.zeroscaninfo = {
  path: path.resolve('..', 'zeroscaninfo'),
  port: 3001,
  endpoints: [
    process.env.ZEROSCANINFO_PRIMARY || 'https://ws.zeroscan.st',
    process.env.ZEROSCANINFO_SECONDARY || 'https://ws.zeroscan.io'
  ],
  supplyCacheTtl: Number(process.env.ZEROSCANINFO_SUPPLY_CACHE_TTL) || 24 * 60 * 60 * 1000,
  supplyRetryInterval: Number(process.env.ZEROSCANINFO_SUPPLY_RETRY_INTERVAL) || 10 * 60 * 1000,
  rpc: {
    protocol: 'http',
    host: 'localhost',
    port: 3889,
    user: 'user',
    password: 'password'
  }
}

exports.coingeckoCoinId = process.env.ZEROSCANINFO_COINGECKO_COIN_ID || 'zhc-zero-hour-cash'
