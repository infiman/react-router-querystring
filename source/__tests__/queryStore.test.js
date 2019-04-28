import qs from 'qs'

import { createQueryStore, PERSISTED_KEY, SHADOW_KEY } from '../'

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
              mutations: [{ add: { foo: 'bar' } }]
            })
          }
        }).cache
      ).toEqual({
        path: {
          path: 'path',
          nested: {
            ':param': {
              path: ':param',
              nested: {
                ':id': {
                  path: ':id',
                  mutated: true,
                  nested: {},
                  [PERSISTED_KEY]: {},
                  [SHADOW_KEY]: {
                    foo: 'bar'
                  }
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
              ...queryStore.createStateObject()
            }
          })
          .clear().cache
      ).toEqual({}))

    test('add without state object', () =>
      expect(queryStore.add({ pathname: '/', search: '' }).cache).toEqual({}))

    test('add -> resolveQueryString', () => {
      queryStore.add({
        pathname: '/path',
        search: '?f=b',
        state: {
          ...queryStore.createStateObject({
            mutations: [{ persist: true, add: { f: 'b' } }]
          })
        }
      })
      queryStore.add({
        pathname: '/path/:param',
        search: '?fo=ba&arr[]=foo&arr[]=bar',
        state: {
          ...queryStore.createStateObject({
            mutations: [
              {
                persist: true,
                add: { fo: 'ba', arr: ['foo', 'bar'] }
              }
            ]
          })
        }
      })
      queryStore.add({
        pathname: '/path/:param/:id',
        search: '?foo=bar',
        state: {
          ...queryStore.createStateObject({
            mutations: [{ persist: true, add: { foo: 'bar' } }]
          })
        }
      })
      queryStore.add({
        pathname: '/path/:param',
        search: '?fo=ba&arr[]=foo&arr[]=bar',
        state: {
          ...queryStore.createStateObject()
        }
      })
      queryStore.add({
        pathname: '/pathname/detached',
        search: '?foo=bar',
        state: {
          ...queryStore.createStateObject({
            mutations: [{ persist: true, add: { foo: 'bar' } }]
          })
        }
      })
      queryStore.add({
        pathname: '/pathname/wildcard',
        search: '?foo=bar&wild=card',
        state: {
          ...queryStore.createStateObject({
            mutations: [
              {
                persist: true,
                scope: '/pathname/*',
                add: { wild: 'card' }
              }
            ]
          })
        }
      })
      queryStore.add({
        pathname: '/',
        search: '?ro=ot',
        state: {
          ...queryStore.createStateObject({
            mutations: [{ persist: true, add: { ro: 'ot' } }]
          })
        }
      })
      queryStore.add({
        pathname: '',
        search: '?wild=card',
        state: {
          ...queryStore.createStateObject({
            mutations: [{ persist: true, add: { wild: 'card', to: 'remove' } }]
          })
        }
      })
      queryStore.add({
        pathname: '',
        search: '?wild=card',
        state: {
          ...queryStore.createStateObject({
            mutations: [
              {
                persist: true,
                add: { wild: 'card' },
                remove: { to: undefined }
              }
            ]
          })
        }
      })

      expect(queryStore.resolveQueryString('/path')).toEqual('?wild=card&f=b')
      expect(
        queryStore.resolveQueryString('/path/:param', [
          {
            persist: true,
            add: {
              bla: 'string',
              arr: ['bla']
            },
            remove: {
              f: undefined,
              arr: ['bar']
            }
          }
        ])
      ).toEqual('?wild=card&fo=ba&arr%5B%5D=foo&arr%5B%5D=bla&bla=string')
      expect(queryStore.resolveQueryString('/path/:param/:id')).toEqual(
        '?wild=card&f=b&fo=ba&arr%5B%5D=foo&arr%5B%5D=bar&foo=bar'
      )
      expect(queryStore.resolveQueryString('/pathname/detached')).toEqual(
        '?wild=card&foo=bar'
      )
      expect(queryStore.resolveQueryString('/')).toEqual('?wild=card&ro=ot')
    })
  })
})
