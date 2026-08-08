const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function readJSON(relativePath) {
  return JSON.parse(read(relativePath))
}

function listFiles(dir) {
  let result = []
  for (const entry of fs.readdirSync(path.join(root, dir), {withFileTypes: true})) {
    const relativePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result = result.concat(listFiles(relativePath))
    } else {
      result.push(relativePath)
    }
  }
  return result
}

function extractRouterPaths() {
  const router = read('app/router.js')
  const paths = []
  const routePattern = /router\.(?:get|post|put|delete|patch)\(\s*(?:`([^`]+)`|'([^']+)'|"([^"]+)")/g
  let match
  while ((match = routePattern.exec(router))) {
    paths.push(match[1] || match[2] || match[3])
  }
  return paths
}

const legacyChain = ['q', 'tum'].join('')
const legacyInfo = [legacyChain, 'info'].join('')
const legacyApi = [legacyInfo, '-api'].join('')
const legacyGithub = ['github.com/', legacyChain, 'project/', legacyApi].join('')
const legacyToken20 = ['q', 'rc20'].join('')
const legacyToken721 = ['q', 'rc721'].join('')

function assertNoLegacyBranding(relativePath) {
  const content = read(relativePath)
  assert(!new RegExp(`\\b${legacyApi}\\b`, 'i').test(content), `${relativePath} still contains legacy api name`)
  assert(!new RegExp(`\\b${legacyInfo}\\b`, 'i').test(content), `${relativePath} still contains legacy info name`)
  assert(!new RegExp(`\\b${legacyChain}\\b`, 'i').test(content), `${relativePath} still contains legacy chain name`)
}

{
  const pkg = readJSON('package.json')
  assert.strictEqual(pkg.name, 'zeroscaninfo-api')
  assert(pkg.scripts.start.includes('--title=zeroscaninfo-api'))
  assert(pkg.scripts.stop.includes('--title=zeroscaninfo-api'))
}

for (const file of ['README.md', 'config/config.default.js', 'agent.js', 'app/extend/application.js']) {
  assertNoLegacyBranding(file)
}

{
  const config = read('config/config.default.js')
  assert(config.includes("chain: 'mainnet'"), 'ZHCASH chain must default to mainnet')
  assert(config.includes('zeroscan.st'), 'primary zeroscan endpoint is missing')
  assert(config.includes('zeroscan.io'), 'secondary zeroscan endpoint is missing')
  assert(config.includes('3889'), 'ZHCASH RPC port 3889 must be retained')
  assert(config.includes("'zhcash_mainnet'"), 'database name must be ZHCASH-specific')
  assert(config.includes('zhc-zero-hour-cash'), 'CoinGecko ZHC coin id is missing')
}

{
  const agent = read('agent.js')
  assert(agent.includes('zeroscaninfo.endpoints'), 'agent must use configured zeroscaninfo endpoints')
  assert(agent.includes('createSocketClient'), 'agent must create socket clients through a helper')
}

{
  const misc = read('app/service/misc.js')
  assert(!misc.includes('1684'), 'Qtum CoinMarketCap coin id must not be used')
  assert(misc.includes('api.coingecko.com'), 'price service must use ZHC price source')
  assert(misc.includes('coingeckoCoinId'), 'price service must use configured CoinGecko id')
}

{
  const paths = extractRouterPaths()
  assert(paths.includes('/info'), '/info endpoint is missing')
  assert(paths.includes('/supply'), '/supply endpoint is missing')
  assert(paths.includes('/block/:block'), '/block/:block endpoint is missing')
  assert(paths.includes('/tx/:id'), '/tx/:id endpoint is missing')
  assert(paths.includes('/address/:address'), '/address/:address endpoint is missing')
  assert(paths.includes('/contract/:contract'), '/contract/:contract endpoint is missing')
  assert(paths.includes('/search'), '/search endpoint is missing')
  assert(paths.includes('/zrc20'), '/zrc20 endpoint is missing')
  assert(paths.includes('/zrc20/txs'), '/zrc20/txs endpoint is missing')
  assert(paths.includes('/zrc721'), '/zrc721 endpoint is missing')
  assert(paths.includes('/address/:address/zrc20-balance/:token'), 'ZRC20 address balance endpoint is missing')
  assert(paths.includes('/address/:address/zrc20-txs/:token'), 'ZRC20 address tx endpoint is missing')
  assert(paths.every(route => !route.includes(`/${legacyToken20}`)), 'public routes must not expose legacy token20 paths')
  assert(paths.every(route => !route.includes(`/${legacyToken721}`)), 'public routes must not expose legacy token721 paths')
  assert(paths.length >= 40, `expected at least 40 HTTP routes, got ${paths.length}`)
}

{
  const docs = listFiles('doc').filter(file => file.endsWith('.md'))
  assert(docs.length >= 6, 'API documentation files are missing')
  for (const file of docs) {
    const content = read(file)
    assert(!new RegExp(legacyGithub, 'i').test(content), `${file} still links to legacy upstream docs`)
    assert(!new RegExp(legacyToken20, 'i').test(content), `${file} still contains legacy token20 name`)
    assert(!new RegExp(legacyToken721, 'i').test(content), `${file} still contains legacy token721 name`)
  }
}

{
  const readme = read('README.md')
  assert(readme.includes('ZRC20'), 'README must document ZRC20')
  assert(readme.includes('ZRC721'), 'README must document ZRC721')
  assert(!new RegExp(legacyToken20, 'i').test(readme), 'README still contains legacy token20 name')
  assert(!new RegExp(legacyToken721, 'i').test(readme), 'README still contains legacy token721 name')
}

console.log('zeroscan-config tests passed')
