import { parsePathname } from '../'

describe('parsePathname module', () => {
  describe('parsePathname', () => {
    test('empty invocation', () =>
      expect(() => parsePathname()).toThrowErrorMatchingSnapshot())

    test('root pathname', () => expect(parsePathname('/')).toEqual(['/']))

    test('simple pathname', () =>
      expect(parsePathname('/pathname/to/narnia')).toEqual([
        'pathname',
        'to',
        'narnia'
      ]))

    test('invalid pathname', () =>
      expect(() => parsePathname('invalid')).toThrowErrorMatchingSnapshot())
  })
})
