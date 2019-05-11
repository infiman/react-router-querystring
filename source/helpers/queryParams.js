import memoize from 'fast-memoize'

import { mergeDeep } from './'

export const addQueryParams = memoize((queryParams, params) =>
  mergeDeep(queryParams, params, (oldValue, newValue) => {
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return [...oldValue, ...newValue]
    }

    return newValue
  })
)

export const removeQueryParams = memoize((queryParams, params) =>
  mergeDeep(queryParams, params, (oldValue, newValue) => {
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return oldValue.filter((item, i) => !newValue.includes(item))
    }

    return newValue
  })
)
