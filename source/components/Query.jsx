import React from 'react'

import { createQueryStore, QUERYSTRING_CACHE_STATE_KEY } from '../queryStore'

export const QueryContext = React.createContext({})

const resolvePath = (
  queryStore,
  { pathname, mutations, hash, state = {} },
  { stringify }
) => {
  const search = queryStore.resolveQueryString(pathname, mutations)
  const justState = {
    ...state,
    ...queryStore.createStateObject({
      mutations,
      ...state[QUERYSTRING_CACHE_STATE_KEY]
    })
  }

  return stringify
    ? { path: `${pathname}${search}${hash}`, state: justState }
    : {
      pathname,
      search,
      hash,
      state: justState
    }
}

export const Query = ({ options, history, children, replace, respect }) => {
  if (replace && !respect) {
    console.warn(
      "There won't be much to replace if you are not respecting foreign query params. Consider using replace with respect!"
    )
  }

  const context = React.useMemo(() => {
    const queryStore = createQueryStore(options)

    return {
      history,
      queryStore,
      resolvePath: resolvePath.bind(null, queryStore)
    }
  }, [history, options])
  const [, setUpdate] = React.useState(null)

  React.useEffect(
    () =>
      history.listen(({ pathname, state, search }) => {
        let needReplace = false
        let justState = { ...state }

        if (!justState[QUERYSTRING_CACHE_STATE_KEY]) {
          const add = context.queryStore.parseQueryString(search)

          justState = {
            ...context.queryStore.createStateObject({
              respect,
              foreign: true,
              mutations: [{ add }]
            })
          }

          needReplace = replace || false
        }

        if (!justState[QUERYSTRING_CACHE_STATE_KEY].replaced) {
          context.queryStore.add({ pathname, state: justState })
        }

        if (needReplace) {
          history.replace(
            `${pathname}${context.queryStore.resolveQueryString(pathname)}`,
            {
              ...justState,
              [QUERYSTRING_CACHE_STATE_KEY]: {
                ...justState[QUERYSTRING_CACHE_STATE_KEY],
                replaced: true
              }
            }
          )
        } else {
          setUpdate(justState)
        }
      }),
    [context, history, replace, respect]
  )

  return (
    <QueryContext.Provider value={{ ...context }}>
      {children}
    </QueryContext.Provider>
  )
}
