import { createQueryStore } from '../queryStore'

const queryStore = createQueryStore()

beforeEach(() => queryStore.clear())

describe('queryStore module', () => {
  describe('createQueryStore', () => {
    test('singleton', () => {
      const newQueryStore = createQueryStore()

      expect(queryStore).toBe(newQueryStore)
    })

    test('add', () => {
      expect(
        queryStore.add({
          pathname: '/path/:param/:id',
          search: '?foo=bar',
          state: { __query__: {} }
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
                    state: { __query__: {} }
                  },
                  nested: {}
                }
              }
            }
          }
        }
      })
    })

    test('clear', () => {
      queryStore
        .add({
          pathname: '/path',
          search: '?foo=bar',
          state: { __query__: {} }
        })
        .clear()

      expect(queryStore.cache).toEqual({})
    })

    test('resolveQueryString', () => {
      queryStore.add({
        pathname: '/path',
        search: '?f=b',
        state: { __query__: {} }
      })
      queryStore.add({
        pathname: '/path/:param',
        search: '?fo=ba&arr[]=foo&arr[]=bar',
        state: { __query__: {} }
      })
      queryStore.add({
        pathname: '/path/:param/:id',
        search: '?foo=bar',
        state: { __query__: {} }
      })
      queryStore.add({
        pathname: '/pathname/detached',
        search: '?foo=bar',
        state: { __query__: {} }
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
