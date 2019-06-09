import React from 'react'

import { QueryContext } from './Query'

export const QueryLink = ({
  children,
  pathname,
  hash,
  state,
  mutations,
  ...props
}) => {
  const { resolvePath } = React.useContext(QueryContext)

  return children({
    ...props,
    path: resolvePath({ pathname, hash, mutations, state })
  })
}
