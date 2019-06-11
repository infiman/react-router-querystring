import React from 'react'

import { QueryContext } from './Query'

let matchedScopes = []

export const QueryParams = ({ children, scope, params }) => {
  const { history, queryStore } = React.useContext(QueryContext)

  if (scope && !matchedScopes.includes(scope)) {
    matchedScopes.push(scope)

    if (params && params.length && history.location.search) {
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
