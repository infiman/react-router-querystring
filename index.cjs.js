const { name } = require('./package.json')
const {
  mutateQueryParams,
  QueryContext,
  Query,
  QueryLink,
  QueryParams
} = require(`./build/cjs/${name}.min.js`)

module.exports = {
  mutateQueryParams,
  QueryContext,
  Query,
  QueryLink,
  QueryParams
}
