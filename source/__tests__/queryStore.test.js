import qs from 'qs'

import { createQueryStore, PERSISTED_KEY, SHADOW_KEY } from '../queryStore'

const QS_CONFIG = {
  arrayFormat: 'brackets',
  addQueryPrefix: true,
  ignoreQueryPrefix: true,
  interpretNumericEntities: true
}

const parseQueryString = queryString => qs.parse(queryString, QS_CONFIG)
const stringifyQueryParams = queryParams => qs.stringify(queryParams, QS_CONFIG)

const queryStore = createQueryStore({
  parseQueryString,
  stringifyQueryParams
})

beforeEach(() => queryStore.clear())

describe('queryStore module', () => {
  describe('createQueryStore', () => {
    test('singleton', () =>
      expect(queryStore).toBe(
        createQueryStore({
          parseQueryString,
          stringifyQueryParams
        })
      ))

    test('add', () =>
      expect(
        queryStore.add({
          pathname: '/path/:param/:id',
          search: '?foo=bar',
          state: {
            ...queryStore.createStateObject({
              persist: true,
              scope: '/path/:param/:id'
            })
          }
        }).cache
      ).toEqual({
        path: {
          nested: {
            ':param': {
              nested: {
                ':id': {
                  location: {
                    pathname: '/path/:param/:id',
                    search: '?foo=bar',
                    state: {
                      ...queryStore.createStateObject({
                        persist: true,
                        scope: '/path/:param/:id'
                      })
                    }
                  },
                  nested: {},
                  [PERSISTED_KEY]: {},
                  [SHADOW_KEY]: {}
                }
              },
              [PERSISTED_KEY]: {},
              [SHADOW_KEY]: {}
            }
          },
          [PERSISTED_KEY]: {},
          [SHADOW_KEY]: {}
        }
      }))

    test('clear', () =>
      expect(
        queryStore
          .add({
            pathname: '/path',
            search: '?foo=bar',
            state: {
              ...queryStore.createStateObject({
                persist: true,
                scope: '/path'
              })
            }
          })
          .clear().cache
      ).toEqual({}))

    test('resolveQueryString', () => {
      queryStore.add({
        pathname: '/path',
        search: '?f=b',
        state: {
          ...queryStore.createStateObject({
            persist: true,
            scope: '/path',
            mutation: { add: { f: 'b' } }
          })
        }
      })
      queryStore.add({
        pathname: '/path/:param',
        search: '?fo=ba&arr[]=foo&arr[]=bar',
        state: {
          ...queryStore.createStateObject({
            persist: true,
            scope: '/path/:param',
            mutation: { add: { fo: 'ba', arr: ['foo', 'bar'] } }
          })
        }
      })
      queryStore.add({
        pathname: '/path/:param/:id',
        search: '?foo=bar',
        state: {
          ...queryStore.createStateObject({
            persist: true,
            scope: '/path/:param/:id',
            mutation: { add: { foo: 'bar' } }
          })
        }
      })
      queryStore.add({
        pathname: '/pathname/detached',
        search: '?foo=bar',
        state: {
          ...queryStore.createStateObject({
            persist: true,
            scope: '/pathname/detached',
            mutation: { add: { foo: 'bar' } }
          })
        }
      })

      expect(queryStore.resolveQueryString('/path')).toEqual('?f=b')
      expect(
        queryStore.resolveQueryString('/path/:param', {
          add: {
            bla: 'string',
            arr: ['bla']
          },
          remove: {
            f: undefined,
            arr: ['bar']
          }
        })
      ).toEqual('?fo=ba&arr%5B%5D=foo&arr%5B%5D=bla&bla=string')
      expect(queryStore.resolveQueryString('/path/:param/:id')).toEqual(
        '?f=b&fo=ba&arr%5B%5D=foo&arr%5B%5D=bar&foo=bar'
      )
      expect(queryStore.resolveQueryString('/pathname/detached')).toEqual(
        '?foo=bar'
      )
    })
  })
})
