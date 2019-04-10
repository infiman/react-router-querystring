import {
  parseQueryString as innerParseQueryString,
  stringifyQueryParams as innerStringifyQueryParams,
  addQueryParams,
  removeQueryParams
} from './helpers/queryString'

const mergeLocationIntoCache = (cache, [path, ...restPath], location) => {
  const occurrence = Object.keys(cache).find(key => key === path)

  if (path) {
    if (!occurrence) {
      cache[path] = {
        nested: {}
      }
    }

    if (!restPath.length) {
      cache[path].location = location
    }

    Object.assign(
      cache[occurrence || path].nested,
      mergeLocationIntoCache(
        cache[occurrence || path].nested,
        restPath,
        location
      )
    )
  }
}

const pickBranchFromCache = (cache, [path, ...restPath], destination = []) => {
  if (path && cache[path]) {
    if (cache[path].location) {
      destination.push(cache[path])
    }

    return pickBranchFromCache(cache[path].nested, restPath, destination)
  }

  return destination
}

const queryStore = {
  add (location) {
    const [, ...parsedPath] = location.pathname.split('/')

    mergeLocationIntoCache(this.cache, parsedPath, location)

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key])

    return this
  },
  resolveQueryString (pathname, { add, remove } = {}) {
    const [, ...parsedTo] = pathname.split('/')
    const branch = pickBranchFromCache(this.cache, parsedTo)
    let queryParams = branch.reduce(
      (destination, { location: { search } }) => ({
        ...destination,
        ...this.parseQueryString(search)
      }),
      {}
    )

    if (add) {
      queryParams = addQueryParams(queryParams, add)
    }

    if (remove) {
      queryParams = removeQueryParams(queryParams, remove)
    }

    return this.stringifyQueryParams(queryParams)
  }
}
let store

export const createQueryStore = ({
  parseQueryString = innerParseQueryString,
  stringifyQueryParams = innerStringifyQueryParams
} = {}) => {
  if (!store) {
    store = Object.create(
      { ...queryStore, parseQueryString, stringifyQueryParams },
      {
        cache: {
          value: {}
        }
      }
    )
  }

  return store
}
