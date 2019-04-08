import {
  parseQueryString,
  stringifyQueryParams,
  addQueryParams,
  removeQueryParams
} from './helpers/queryString'

const queryStore = {
  add (path, location) {
    this.cache[path] = location

    return this
  },
  resolveQueryString (to) {
    console.log(this, to)
    console.warn('NOT IMPLEMENTED YET!')
  }
}
let store

const createQueryStore = () => {
  if (!store) {
    store = Object.create(queryStore)

    store.cache = {}
  }

  return store
}

export {
  createQueryStore,
  parseQueryString,
  stringifyQueryParams,
  addQueryParams,
  removeQueryParams
}
