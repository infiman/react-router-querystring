const { name } = require('./package.json')
const {
  QUERYSTRING_CACHE_STATE_KEY,
  createQueryStore,
  addQueryParams,
  removeQueryParams
} = require(process.env.NODE_ENV === 'production'
  ? `./build/cjs/${name}.min.js`
  : `./build/cjs/${name}.js`)

module.exports = {
  QUERYSTRING_CACHE_STATE_KEY,
  createQueryStore,
  addQueryParams,
  removeQueryParams
}
