import { parsePathname } from './helpers/parsePathname'
import {
  addQueryParams as addQueryParamsInternal,
  removeQueryParams as removeQueryParamsInternal
} from './helpers/queryParams'
import { updateDeep } from './helpers/update'

const WILDCARD_SCOPE = '*'
export const QUERYSTRING_CACHE_STATE_KEY =
  '@@__QUERYSTRING_CACHE_STATE_OBJECT__@@'
export const NESTED_KEY = 'nested'
export const PERSISTED_KEY = 'persisted'
export const SHADOW_KEY = Symbol('shadow')

const createKey = () =>
  Math.random()
    .toString(36)
    .substr(2, 7)

const createPartialCache = partialCache => ({
  [NESTED_KEY]: {},
  [PERSISTED_KEY]: {},
  [SHADOW_KEY]: {},
  ...partialCache
})

const createStateObject = ({ mutations, ...rest } = {}) => ({
  [QUERYSTRING_CACHE_STATE_KEY]: {
    ...rest,
    key: createKey(),
    mutations: mutations || []
  }
})

const pickBranchFromCache = (
  cache,
  [path, ...restPath] = [],
  destination = []
) => {
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

const flushNestedPartialCaches = (partialCache, rootPaths = []) => {
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
    this.history[this.currentHistoryKey] = value
  },
  add ({ pathname = '', state }) {
    // eslint-disable-next-line standard/computed-property-even-spacing
    const { key, mutations, foreign, respect, match } = state[
      QUERYSTRING_CACHE_STATE_KEY
    ]

    if (Object.prototype.hasOwnProperty.call(this.history, key)) {
      this.currentHistoryKey = key

      return this
    }

    let newCache = this.cache

    mutations.forEach(({ scope, persist, add, remove }) => {
      newCache = updateDeep(
        newCache,
        parsePathname(scope || pathname).flatMap((path, i, { length }) =>
          i < length - 1 ? [path, NESTED_KEY] : path
        ),
        (oldValue, path, { tail }) => {
          if (!tail) {
            if (foreign && !respect && path !== NESTED_KEY) {
              return createPartialCache({
                path,
                [NESTED_KEY]: oldValue[NESTED_KEY]
              })
            }

            return oldValue
          } else {
            const partialCache =
              oldValue || createPartialCache({ path, mutated: true })

            if (foreign) {
              return {
                ...partialCache,
                [PERSISTED_KEY]: respect ? partialCache[PERSISTED_KEY] : {},
                [SHADOW_KEY]: respect ? add : {},
                [NESTED_KEY]: flushNestedPartialCaches(
                  partialCache[NESTED_KEY],
                  Object.keys(partialCache[NESTED_KEY])
                )
              }
            } else {
              const strategy = persist ? PERSISTED_KEY : SHADOW_KEY
              let newStrategyValue = partialCache[strategy]

              if (remove) {
                newStrategyValue = this.removeQueryParams(
                  newStrategyValue,
                  remove
                )
              }

              if (add) {
                newStrategyValue = this.addQueryParams(newStrategyValue, add)
              }

              return {
                ...partialCache,
                [strategy]: newStrategyValue,
                [NESTED_KEY]: match
                  ? partialCache[NESTED_KEY]
                  : flushNestedPartialCaches(
                    partialCache[NESTED_KEY],
                    Object.keys(partialCache[NESTED_KEY])
                  )
              }
            }
          }
        },
        path => (path === NESTED_KEY ? {} : createPartialCache({ path }))
      )
    })

    if (!match) {
      newCache = flushNestedPartialCaches(
        newCache,
        Object.keys(newCache).filter(
          key => ![WILDCARD_SCOPE, parsePathname(pathname)[0]].includes(key)
        )
      )
    }

    this.currentHistoryKey = key
    this.cache = newCache

    return this
  },
  resolveQueryString (scope = '', mutations = []) {
    const branch = pickBranchFromCache(this.cache, parsePathname(scope))
    let queryParams = branch.reduce(
      (destination, partialCache) =>
        this.addQueryParams(destination, {
          ...partialCache[SHADOW_KEY],
          ...partialCache[PERSISTED_KEY]
        }),
      {}
    )

    mutations.forEach(({ add, remove }) => {
      if (remove) {
        queryParams = this.removeQueryParams(queryParams, remove)
      }

      if (add) {
        queryParams = this.addQueryParams(queryParams, add)
      }
    })

    return this.stringifyQueryParams(queryParams)
  },
  clear () {
    this.history = {}
    this.currentHistoryKey = createKey()
    this.cache = {}

    return this
  },
  toString () {
    return JSON.stringify(this.cache)
  }
}

let store
export const createQueryStore = ({
  initialCache,
  parseQueryString,
  stringifyQueryParams,
  addQueryParams,
  removeQueryParams
} = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof parseQueryString !== 'function') {
      throw new Error(
        `parseQueryString param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
          parseQueryString
        )}.`
      )
    }

    if (typeof stringifyQueryParams !== 'function') {
      throw new Error(
        `stringifyQueryParams param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
          stringifyQueryParams
        )}.`
      )
    }
  }

  if (!store) {
    const currentHistoryKey = createKey()

    store = Object.assign(
      Object.create(
        Object.assign(queryStore, {
          createStateObject,
          parseQueryString,
          stringifyQueryParams,
          addQueryParams: addQueryParams || addQueryParamsInternal,
          removeQueryParams: removeQueryParams || removeQueryParamsInternal
        })
      ),
      {
        currentHistoryKey,
        history: { [currentHistoryKey]: initialCache || {} }
      }
    )
  }

  return store
}
