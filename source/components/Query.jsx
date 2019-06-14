import React from 'react'

import { createQueryStore, QUERYSTRING_CACHE_STATE_KEY } from '../queryStore'
import { isPlainObject } from '../helpers'

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
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(options)) {
      throw new Error(
        `options prop is not valid. Expecting: object! Received: ${Object.prototype.toString.call(
          options
        )}.`
      )
    }

    if (!isPlainObject(history)) {
      throw new Error(
        `history prop is not valid. Expecting: object! Received: ${Object.prototype.toString.call(
          history
        )}.`
      )
    }

    if (
      typeof history.listen !== 'function' ||
      typeof history.replace !== 'function' ||
      !isPlainObject(history.location)
    ) {
      throw new Error(
        `history prop is not valid. Expecting: history.listen: function, history.replace: function, history.location: object! Received: history.listen: ${Object.prototype.toString.call(
          history.listen
        )}, history.replace: ${Object.prototype.toString.call(
          history.replace
        )}, history.location: ${Object.prototype.toString.call(
          history.location
        )}.`
      )
    }

    if (replace && !respect) {
      console.warn(
        "There won't be much to replace if you are not respecting foreign query params. Consider using replace with respect!"
      )
    }
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
      history.listen(({ pathname, search, hash, state }) => {
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
          const { path, state } = context.resolvePath(
            {
              pathname,
              hash,
              state: { [QUERYSTRING_CACHE_STATE_KEY]: { replaced: true } }
            },
            { stringify: true }
          )

          history.replace(path, state)
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
