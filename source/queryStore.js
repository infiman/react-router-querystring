import {
  parsePathname,
  addQueryParams,
  removeQueryParams,
  updateDeep
} from './helpers'

const QUERYSTRING_CACHE_STATE_KEY = '@@__querystringCacheStateObject__@@'
const WILDCARD_SCOPE = '*'
export const NESTED_KEY = 'nested'
export const PERSISTED_KEY = 'persisted'
export const SHADOW_KEY = Symbol('shadow')

const createPartialCache = partialCache => ({
  [NESTED_KEY]: {},
  [PERSISTED_KEY]: {},
  [SHADOW_KEY]: {},
  ...partialCache
})

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
      ? pickBranchFromCache(partialCache[NESTED_KEY], restPath, destination)
      : destination
  } else {
    return destination
  }
}

const flushNestedPartialCaches = (partialCache, rootPaths) => {
  return rootPaths.reduce(
    (destination, key) => {
      return {
        ...destination,
        [key]: {
          ...partialCache[key],
          [SHADOW_KEY]: {},
          [NESTED_KEY]: flushNestedPartialCaches(
            partialCache[key][NESTED_KEY],
            Object.keys(partialCache[key][NESTED_KEY])
          )
        }
      }
    },
    { ...partialCache }
  )
}

const queryStore = {
  get cache () {
    return this.history[this.currentHistoryKey]
  },
  set cache (value) {
    this.currentHistoryKey = `${Date.now()}`
    this.history[this.currentHistoryKey] = value
  },
  add ({ pathname, state }) {
    const { mutations } = (state && state[QUERYSTRING_CACHE_STATE_KEY]) || {}

    if (!mutations) {
      return this
    }

    let newCache = this.cache

    mutations.forEach(({ scope, persist, add, remove }) => {
      newCache = updateDeep(
        newCache,
        parsePathname(scope || pathname).flatMap((path, i, { length }) =>
          i < length - 1 ? [path, NESTED_KEY] : path
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
            [NESTED_KEY]: flushNestedPartialCaches(
              partialCache[NESTED_KEY],
              Object.keys(partialCache[NESTED_KEY])
            )
          }
        },
        path => (path === NESTED_KEY ? {} : createPartialCache({ path }))
      )
    })

    newCache = flushNestedPartialCaches(
      newCache,
      Object.keys(newCache).filter(
        key => ![WILDCARD_SCOPE, parsePathname(pathname)[0]].includes(key)
      )
    )

    this.cache = newCache

    return this
  },
  resolveQueryString (scope, mutations = []) {
    const branch = pickBranchFromCache(this.cache, parsePathname(scope))
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
  clear () {
    this.cache = {}

    return this
  },
  toString () {
    return JSON.stringify(this.cache)
  }
}

const createStateObject = ({ mutations, ...rest } = {}) => ({
  [QUERYSTRING_CACHE_STATE_KEY]: {
    mutations: mutations || [],
    ...rest
  }
})

let store
export const createQueryStore = ({
  initialCache,
  parseQueryString,
  stringifyQueryParams
} = {}) => {
  if (!store) {
    const currentHistoryKey = `${Date.now()}`

    store = Object.assign(
      Object.create(
        Object.assign(queryStore, {
          createStateObject,
          parseQueryString,
          stringifyQueryParams
        }),
        {
          history: {
            value: { [currentHistoryKey]: initialCache || {} }
          }
        }
      ),
      { currentHistoryKey }
    )
  }

  return store
}
