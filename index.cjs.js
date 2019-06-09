const { name } = require('./package.json')
const { QueryContext, Query, QueryLink } = require(`./build/cjs/${name}.min.js`)

module.exports = {
  QueryContext,
  Query,
  QueryLink
}
