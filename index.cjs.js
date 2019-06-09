const { name } = require('./package.json')
const {
  QUERYSTRING_CACHE_STATE_KEY,
  createQueryStore,
  addQueryParams,
  removeQueryParams
} = require(`./build/cjs/${name}.js`)

module.exports = {
  QUERYSTRING_CACHE_STATE_KEY,
  createQueryStore,
  addQueryParams,
  removeQueryParams
}
