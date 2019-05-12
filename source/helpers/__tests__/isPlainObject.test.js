import { isPlainObject } from '../'

describe('isPlainObject module', () => {
  describe('isPlainObject', () => {
    test('empty invocation', () => expect(isPlainObject()).toBeFalsy())

    test('plain object', () => expect(isPlainObject({})).toBeTruthy())

    test('plain object without prototype chain', () =>
      expect(isPlainObject(Object.create(null))).toBeTruthy())

    test('array', () => expect(isPlainObject([])).toBeFalsy())

    test('Set', () => expect(isPlainObject(new Set())).toBeFalsy())
    test('Map', () => expect(isPlainObject(new Map())).toBeFalsy())

    test('primitives', () => expect(isPlainObject(3)).toBeFalsy()) ||
      expect(isPlainObject('string')).toBeFalsy() ||
      expect(isPlainObject(true)).toBeFalsy() ||
      expect(Symbol('symbol')).toBeFalsy() ||
      expect(isPlainObject(null)).toBeFalsy() ||
      expect(isPlainObject(undefined)).toBeFalsy()
  })
})
