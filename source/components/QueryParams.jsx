import React from 'react'

import { QueryContext } from './Query'

let matchedScopes = []

export const QueryParams = ({ children, scope, params }) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof scope !== 'string') {
      throw new Error(
        `scope prop is not valid. Expecting: string! Received: ${Object.prototype.toString.call(
          scope
        )}.`
      )
    }

    if (!Array.isArray(params)) {
      throw new Error(
        `params prop is not valid. Expecting: array! Received: ${Object.prototype.toString.call(
          params
        )}.`
      )
    }
  }

  const { history, queryStore } = React.useContext(QueryContext)

  if (!matchedScopes.includes(scope)) {
    matchedScopes.push(scope)

    if (params.length && history.location.search) {
      const queryParams = queryStore.parseQueryString(history.location.search)
      const ownQueryParams = Object.keys(queryParams).reduce(
        (destination, param) =>
          params.includes(param)
            ? {
              ...destination,
              [param]: queryParams[param]
            }
            : destination,
        {}
      )

      queryStore.add({
        pathname: scope,
        state: {
          ...queryStore.createStateObject({
            match: true,
            mutations: [{ add: ownQueryParams }]
          })
        }
      })
    }
  }

  return children
}
