import {
  parseQueryString,
  stringifyQueryParams,
  addQueryParams,
  removeQueryParams
} from '../queryString'

const QUERY_STRING_WITHOUT_PREFIX = 'a=true&b%5B%5D=foo&b%5B%5D=bar&c=string'
const QUERY_STRING_WITH_PREFIX = `?${QUERY_STRING_WITHOUT_PREFIX}`
const QUERY_PARAMS = Object.freeze({
  a: 'true',
  b: ['foo', 'bar'],
  c: 'string'
})
const EMPTY_QUERY_PARAMS = Object.freeze({})

describe('queryString module', () => {
  describe('parseQueryString', () => {
    test('without query string prefix', () =>
      expect(parseQueryString(QUERY_STRING_WITHOUT_PREFIX)).toEqual(
        QUERY_PARAMS
      ))

    test('with query string prefix', () =>
      expect(parseQueryString(QUERY_STRING_WITH_PREFIX)).toEqual(QUERY_PARAMS))

    test('memoization', () => {
      const first = parseQueryString(QUERY_STRING_WITHOUT_PREFIX)
      const second = parseQueryString(QUERY_STRING_WITH_PREFIX)
      const third = parseQueryString(QUERY_STRING_WITHOUT_PREFIX)

      expect(first).toBe(third)
      expect(first).not.toBe(second)
      expect(third).not.toBe(second)
    })
  })

  describe('stringifyQueryParams', () => {
    test('with query params', () =>
      expect(stringifyQueryParams(QUERY_PARAMS)).toEqual(
        QUERY_STRING_WITH_PREFIX
      ))
  })

  describe('addQueryParams', () => {
    test('with empty objects', () =>
      expect(addQueryParams(EMPTY_QUERY_PARAMS, EMPTY_QUERY_PARAMS)).toEqual(
        EMPTY_QUERY_PARAMS
      ))

    test('with partial params', () =>
      expect(
        addQueryParams(
          { a: 'true', b: ['foo'], c: 'str', h: { j: '1' } },
          {
            b: ['bar'],
            c: 'string',
            d: 3,
            e: null,
            f: undefined,
            h: { k: 2 }
          }
        )
      ).toEqual({
        ...QUERY_PARAMS,
        c: 'string',
        d: 3,
        e: null,
        f: undefined,
        h: { j: '1', k: 2 }
      }))

    test('memoization', () => {
      const first = addQueryParams(QUERY_PARAMS, { d: 'new' })
      const second = addQueryParams(QUERY_PARAMS, { c: 'new' })
      const third = addQueryParams(QUERY_PARAMS, { d: 'new' })

      expect(first).toBe(third)
      expect(first).not.toBe(second)
      expect(third).not.toBe(second)
    })
  })

  describe('removeQueryParams', () => {
    test('with empty objects', () =>
      expect(removeQueryParams(EMPTY_QUERY_PARAMS, EMPTY_QUERY_PARAMS)).toEqual(
        EMPTY_QUERY_PARAMS
      ))

    test('with partial params', () =>
      expect(
        removeQueryParams(
          {
            ...QUERY_PARAMS,
            c: 'string',
            h: { k: {} }
          },
          {
            b: ['bar'],
            c: 'string',
            h: { k: undefined }
          }
        )
      ).toEqual({ ...QUERY_PARAMS, b: ['foo'], h: {} }))

    test('memoization', () => {
      const first = removeQueryParams(QUERY_PARAMS, { a: undefined })
      const second = removeQueryParams(QUERY_PARAMS, { c: 'new' })
      const third = removeQueryParams(QUERY_PARAMS, { a: undefined })

      expect(first).toBe(third)
      expect(first).not.toBe(second)
      expect(third).not.toBe(second)
    })
  })
})
