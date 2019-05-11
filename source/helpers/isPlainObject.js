export const isPlainObject = maybeObject =>
  maybeObject &&
  typeof maybeObject === 'object' &&
  (typeof maybeObject.constructor !== 'function' ||
    maybeObject.constructor.name === 'Object')
