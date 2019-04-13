import memoize from 'fast-memoize'

import { addQueryParams, removeQueryParams } from './helpers/queryString'

const STATE_CACHE_KEY = '__queryStringCacheStateObject__'
const ROOT_SCOPE = '/'
const ROOT_WILDCARD = '*'

const parsePathname = memoize(pathname => {
  const [, ...splitPathname] = pathname.split('/')

  if (splitPathname.length) {
    if (!splitPathname[0]) {
      splitPathname[0] = ROOT_SCOPE
    }

    return splitPathname
  }

  return ROOT_WILDCARD
})

const mergeLocationIntoCache = (cache, [path, ...restPath], location) => {
  const occurrence = Object.keys(cache).find(key => key === path)

  if (path) {
    if (!occurrence) {
      cache[path] = {
        nested: {},
        persisted: {}
      }
    }

    const partialCache = cache[occurrence || path]

    if (!restPath.length) {
      const stateObject = location.state[STATE_CACHE_KEY]

      partialCache.location = location

      if (stateObject.persist) {
        if (stateObject.mutation.remove) {
          partialCache.persisted = removeQueryParams(
            partialCache.persisted,
            stateObject.mutation.remove
          )
        }

        if (stateObject.mutation.add) {
          partialCache.persisted = addQueryParams(
            partialCache.persisted,
            stateObject.mutation.add
          )
        }
      }
    }

    Object.assign(
      partialCache.nested,
      mergeLocationIntoCache(partialCache.nested, restPath, location)
    )
  }
}

const pickBranchFromCache = (cache, [path, ...restPath], destination = []) => {
  const partialCache = cache[path]

  if (path && cache[path]) {
    if (partialCache.location) {
      destination.push(partialCache)
    }

    return pickBranchFromCache(partialCache.nested, restPath, destination)
  }

  return destination
}

const queryStore = {
  add (location) {
    const stateObject = location.state[STATE_CACHE_KEY]

    if (!stateObject) {
      return this
    }

    const parsedPathname = parsePathname(stateObject.scope)

    mergeLocationIntoCache(this.cache, parsedPathname, location)

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key])

    return this
  },
  resolveQueryString (scope, { add, remove } = {}) {
    const parsedPathname = parsePathname(scope)
    const branch = pickBranchFromCache(this.cache, parsedPathname)
    let queryParams = branch.reduce(
      (destination, { persisted }) => addQueryParams(destination, persisted),
      {}
    )

    if (remove) {
      queryParams = removeQueryParams(queryParams, remove)
    }

    if (add) {
      queryParams = addQueryParams(queryParams, add)
    }

    return this.stringifyQueryParams(queryParams)
  }
}

const createStateObject = payload => ({
  [STATE_CACHE_KEY]: {
    persist: false,
    scope: ROOT_SCOPE,
    mutation: {},
    ...payload
  }
})

let store
export const createQueryStore = ({
  parseQueryString,
  stringifyQueryParams
} = {}) => {
  if (!store) {
    store = Object.create(
      {
        ...queryStore,
        createStateObject,
        parseQueryString,
        stringifyQueryParams
      },
      {
        cache: {
          value: {}
        }
      }
    )
  }

  return store
}
