import memoize from 'fast-memoize'

export const addQueryParams = memoize((queryParams, params) =>
  Object.keys(params || {}).reduce(
    (destination, key) => {
      const target = destination[key]
      const patch = params[key]
      const payload = {}

      if (Array.isArray(patch) && Array.isArray(target)) {
        payload[key] = [...target, ...patch]
      } else if (
        patch &&
        typeof patch === 'object' &&
        target &&
        typeof target === 'object'
      ) {
        payload[key] = addQueryParams(target, patch)
      } else if (typeof patch !== 'undefined') {
        payload[key] = patch
      } else {
        payload[key] = target
      }

      return {
        ...destination,
        ...payload
      }
    },
    { ...(queryParams || {}) }
  )
)

export const removeQueryParams = memoize((queryParams, params) =>
  Object.keys(params || {}).reduce(
    (destination, key) => {
      const target = queryParams[key]
      const patch = params[key]
      const payload = {}

      if (Array.isArray(patch) && Array.isArray(target)) {
        payload[key] = target.filter((item, i) => !patch.includes(item))
      } else if (
        patch &&
        typeof patch === 'object' &&
        target &&
        typeof target === 'object'
      ) {
        payload[key] = removeQueryParams(target, patch)
      } else if (typeof patch === 'undefined') {
        delete destination[key]
      }

      return {
        ...destination,
        ...payload
      }
    },
    { ...(queryParams || {}) }
  )
)
