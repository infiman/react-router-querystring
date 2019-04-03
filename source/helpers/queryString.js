import qs from 'qs'
import _ from 'lodash'

const QS_CONFIG = {
  arrayFormat: 'brackets',
  addQueryPrefix: true,
  ignoreQueryPrefix: true
}

const mergeOrReplace = (target, patch) => {
  switch (true) {
    case patch instanceof Array: {
      if (!(target instanceof Array)) {
        throw new Error(
          `Incompatible types to merge. Provided: array. Expected: ${typeof target}`
        )
      }

      return [...target, ...patch]
    }
    case typeof patch === 'object': {
      if (typeof target !== 'object') {
        throw new Error(
          `Incompatible types to merge. Provided: object. Expected: ${typeof target}`
        )
      }

      return { ...target, ...patch }
    }
    default:
      return patch
  }
}

const filterOrRemove = (target, patch) => {
  switch (true) {
    case !patch:
      return undefined
    case patch instanceof Array: {
      if (!(target instanceof Array)) {
        throw new Error(
          `Incompatible types to merge. Provided: Array. Expected: ${typeof target}`
        )
      }

      return target.filter((item, i) => !patch.includes(item))
    }
    default:
      return target
  }
}

export const parseQueryString = _.memoize((queryString, options = QS_CONFIG) =>
  qs.parse(queryString, options)
)

export const stringifyQueryParams = _.memoize(
  (queryParams, options = QS_CONFIG) => qs.stringify(queryParams, options)
)

export const omitQueryParams = _.memoize((queryParams, paths = []) =>
  _.omit(queryParams, paths)
)

export const pickQueryParams = _.memoize((queryParams, paths = []) =>
  _.pick(queryParams, paths)
)

export const addQueryParams = _.memoize((queryParams, params = {}) =>
  Object.keys(params).reduce(
    (destination, key) => ({
      ...destination,
      [key]: mergeOrReplace(queryParams[key], params[key])
    }),
    queryParams
  )
)

export const removeQueryParams = _.memoize((queryParams, params = {}) =>
  Object.keys(params).reduce(
    (destination, key) => ({
      ...destination,
      [key]: filterOrRemove(queryParams[key], params[key])
    }),
    queryParams
  )
)
