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

const queryStore = {
  add (path, location) {
    const [, ...parsedPath] = path.split('/')

    mergeLocationIntoCache(this.cache, parsedPath, location)

    return this
  },
  clear () {
    Object.keys(this.cache).forEach(key => delete this.cache[key])

    return this
  },
  resolveQueryString (to) {
    console.log(this, to)
    console.warn('NOT IMPLEMENTED YET!')
  }
}
let store

export const createQueryStore = () => {
  if (!store) {
    store = Object.create(queryStore, {
      cache: {
        value: {}
      }
    })
  }

  return store
}
