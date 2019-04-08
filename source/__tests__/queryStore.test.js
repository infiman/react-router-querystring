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
        queryStore.add('/path/:param/:id', { search: '?foo=bar' }).cache
      ).toEqual({
        path: {
          nested: {
            ':param': {
              nested: {
                ':id': {
                  location: {
                    search: '?foo=bar'
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
      queryStore.add('/path', { search: '?foo=bar' }).clear()

      expect(queryStore.cache).toEqual({})
    })

    test.todo('resolveQueryString')
  })
})
