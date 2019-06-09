const { name } = require('./package.json')
const { QueryContext, Query, QueryLink } = require(process.env.NODE_ENV ===
  'production'
  ? `./build/cjs/${name}.min.js`
  : `./build/cjs/${name}.js`)

module.exports = {
  QueryContext,
  Query,
  QueryLink
}
