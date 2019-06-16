import { update, updateDeep } from '../update'

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

    test('empty plain object', () =>
      expect(
        updateDeep({}, ['a', 'b', 'c'], (oldValue, key, { tail }) =>
          tail ? key : oldValue
        )
      ).toEqual({
        a: { b: { c: 'c' } }
      }))

    test('nested plain object', () =>
      expect(
        updateDeep(
          { a: { b: { c: 'c' } } },
          ['a', 'b', 'c'],
          (oldValue, _, { tail }) => (tail ? 'updated' : oldValue)
        )
      ).toEqual({ a: { b: { c: 'updated' } } }))

    test('no changes', () => {
      const target = { a: { b: { c: 'c' } } }

      expect(
        updateDeep(target, ['a', 'b', 'c'], (oldValue, _, { tail }) =>
          tail ? 'c' : oldValue
        )
      ).toBe(target)
    })

    test('immutable', () => {
      const target = { a: { b: { c: 'c' } } }

      expect(updateDeep(target, ['a', 'b', 'c'], () => 'updated')).not.toBe(
        target
      )
    })
  })
})
