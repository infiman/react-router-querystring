import { merge, mergeDeep } from '../'

describe('merge module', () => {
  describe('merge', () => {
    test('empty invocation', () =>
      expect(() => merge()).toThrowErrorMatchingSnapshot())

    test('without patch', () => {
      const target = { a: 'a' }

      expect(merge(target)).toBe(target)
    })

    test('with empty patch', () => {
      const target = { a: 'a' }

      expect(merge(target, {})).toBe(target)
    })

    test('with similar patch', () => {
      const target = { a: 'a' }

      expect(merge(target, { a: 'a' })).toBe(target)
    })

    test('couple of plain objects', () =>
      expect(merge({ a: 'a' }, { b: 'b' })).toEqual({ a: 'a', b: 'b' }))

    test('three plain objects', () =>
      expect(merge({ a: 'a' }, [{ b: 'b' }, { c: 'c' }])).toEqual({
        a: 'a',
        b: 'b',
        c: 'c'
      }))

    test('immutable', () => {
      const target = { a: 'a' }
      const patch = { b: 'b' }

      expect(merge(target, patch)).not.toBe(target)
    })

    test('with merger', () =>
      expect(
        merge(
          { a: 'a', c: 'c' },
          { b: 'b', d: 'd', e: 'e' },
          (oldValue, newValue, key) =>
            key === 'c' || key === 'd' ? oldValue : newValue
        )
      ).toEqual({ a: 'a', b: 'b', c: 'c', e: 'e' }))
  })

  describe('mergeDeep', () => {
    test('couple of nested plain objects with similar structure', () =>
      expect(mergeDeep({ a: 'a', b: { c: 'c' } }, { b: { d: 'd' } })).toEqual({
        a: 'a',
        b: { c: 'c', d: 'd' }
      }))

    test('couple of nested plain objects with different structure', () =>
      expect(mergeDeep({ a: 'a', b: { c: 'c' } }, { b: undefined })).toEqual({
        a: 'a',
        b: undefined
      }))

    test('with merger', () =>
      expect(
        mergeDeep(
          { a: 'a', b: { c: 'c' } },
          { a: undefined, b: { c: undefined, d: 'd' } },
          (oldValue, newValue, key) =>
            key === 'a' || key === 'c' ? newValue : oldValue
        )
      ).toEqual({ a: undefined, b: { c: undefined, d: undefined } }))
  })
})
