import {
  parsePathname,
  addQueryParams,
  removeQueryParams,
  updateDeep
} from './helpers'

const QUERYSTRING_CACHE_STATE_KEY = '__querystringCacheStateObject__'
const WILDCARD_SCOPE = '*'
export const PERSISTED_KEY = 'persisted'
export const SHADOW_KEY = Symbol('shadow')

const pickBranchFromCache = (cache, [path, ...restPath], destination = []) => {
  if (path) {
    const partialWildcardCache = cache[WILDCARD_SCOPE]
    const partialCache = cache[path]

    if (partialWildcardCache && partialWildcardCache.mutated) {
      destination.push(partialWildcardCache)
    }

    if (partialCache && partialCache.mutated) {
      destination.push(partialCache)
    }

    return partialCache
      ? pickBranchFromCache(partialCache.nested, restPath, destination)
      : destination
  } else {
    return destination
  }
}

const createPartialCache = partialCache => ({
  nested: {},
  [PERSISTED_KEY]: {},
  [SHADOW_KEY]: {},
  ...partialCache
})

const flushNestedPartialCaches = (partialCache, rootPaths) => {
  return rootPaths.reduce(
    (destination, key) => {
      return {
        ...destination,
        [key]: {
          ...partialCache[key],
          [SHADOW_KEY]: {},
          nested: flushNestedPartialCaches(
            partialCache[key].nested,
            Object.keys(partialCache[key].nested)
          )
        }
      }
    },
    { ...partialCache }
  )
}

const queryStore = {
  add ({ pathname, state }) {
    const { mutations } = (state && state[QUERYSTRING_CACHE_STATE_KEY]) || {}

    if (!mutations) {
      return this
    }

    mutations.forEach(({ scope, persist, add, remove }) => {
      this.cache = updateDeep(
        this.cache,
        parsePathname(scope || pathname).flatMap((path, i, { length }) =>
          i < length - 1 ? [path, 'nested'] : path
        ),
        (oldValue, path) => {
          const partialCache = oldValue || createPartialCache({ path })
          const strategy = persist ? PERSISTED_KEY : SHADOW_KEY
          let newStrategyValue = partialCache[strategy]

          if (remove) {
            newStrategyValue = removeQueryParams(newStrategyValue, remove)
          }

          if (add) {
            newStrategyValue = addQueryParams(newStrategyValue, add)
          }

          return {
            ...partialCache,
            path,
            mutated: true,
            [strategy]: newStrategyValue,
            nested: flushNestedPartialCaches(
              partialCache.nested,
              Object.keys(partialCache.nested)
            )
          }
        },
        path => (path === 'nested' ? {} : createPartialCache({ path }))
      )
    })

    this.cache = flushNestedPartialCaches(
      this.cache,
      Object.keys(this.cache).filter(
        key => ![WILDCARD_SCOPE, parsePathname(pathname)[0]].includes(key)
      )
    )

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key])

    return this
  },
  resolveQueryString (scope, mutations = []) {
    const parsedPathname = parsePathname(scope)
    const branch = pickBranchFromCache(this.cache, parsedPathname)
    let queryParams = branch.reduce(
      (destination, partialCache) =>
        addQueryParams(destination, {
          ...partialCache[SHADOW_KEY],
          ...partialCache[PERSISTED_KEY]
        }),
      {}
    )

    mutations.forEach(({ add, remove }) => {
      if (remove) {
        queryParams = removeQueryParams(queryParams, remove)
      }

      if (add) {
        queryParams = addQueryParams(queryParams, add)
      }
    })

    return this.stringifyQueryParams(queryParams)
  },
  toString () {
    return JSON.stringify(this.cache)
  }
}

const createStateObject = ({ mutations } = {}) => ({
  [QUERYSTRING_CACHE_STATE_KEY]: {
    mutations: mutations || []
  }
})

let store
export const createQueryStore = ({
  initialCache,
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
          value: initialCache || {},
          writable: true // TODO: Get rid of this after cache become history
        }
      }
    )
  }

  return store
}
