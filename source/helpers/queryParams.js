import memoize from 'fast-memoize'

import { mergeDeep } from './'

const addStrategyMerger = (oldValue, newValue) => {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    return [...oldValue, ...newValue]
  }

  return newValue
}

const removeStrategyMerger = (oldValue, newValue) => {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    return oldValue.filter((item, i) => !newValue.includes(item))
  }

  return newValue
}

export const mutateQueryParams = strategy =>
  memoize((queryParams, params) => mergeDeep(queryParams, params, strategy))

export const addQueryParams = mutateQueryParams(addStrategyMerger)

export const removeQueryParams = mutateQueryParams(removeStrategyMerger)
