import { update, updateDeep } from '../'

describe('update module', () => {
  describe('update', () => {
    test('empty invocation', () =>
      expect(() => update()).toThrowErrorMatchingSnapshot())

    test('one param', () =>
      expect(() => update({})).toThrowErrorMatchingSnapshot())

    test('two params', () =>
      expect(() => update({}, 'a')).toThrowErrorMatchingSnapshot())
  })

  describe('updateDeep', () => {
    test('empty invocation', () =>
      expect(() => updateDeep()).toThrowErrorMatchingSnapshot())

    test('one param', () =>
      expect(() => updateDeep({})).toThrowErrorMatchingSnapshot())

    test('two params', () =>
      expect(() => updateDeep({}, [])).toThrowErrorMatchingSnapshot())

    test('flat plain object', () =>
      expect(updateDeep({ a: 'c' }, ['a'], () => 'updated')).toEqual({
        a: 'updated'
      }))

    test('nested plain object', () =>
      expect(
        updateDeep({ a: { b: { c: 'c' } } }, ['a', 'b', 'c'], () => 'updated')
      ).toEqual({ a: { b: { c: 'updated' } } }))

    test('no changes', () => {
      const target = { a: { b: { c: 'c' } } }

      expect(updateDeep(target, ['a', 'b', 'c'], () => 'c')).toBe(target)
    })

    test('immutable', () => {
      const target = { a: { b: { c: 'c' } } }

      expect(updateDeep(target, ['a', 'b', 'c'], () => 'updated')).not.toBe(
        target
      )
    })
  })
})
