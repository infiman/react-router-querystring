import { isPlainObject } from './isPlainObject'

export const update = (target, path, updater) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(target)) {
      throw new Error(
        `target param is not valid. Expecting: object! Received: ${Object.prototype.toString.call(
          target
        )}.`
      )
    }

    if (typeof path !== 'string') {
      throw new Error(
        `path param is not valid. Expecting: string! Received: ${Object.prototype.toString.call(
          path
        )}.`
      )
    }

    if (typeof updater !== 'function') {
      throw new Error(
        `updater param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
          updater
        )}.`
      )
    }
  }

  const hasValue = Object.prototype.hasOwnProperty.call(target, path)
  const oldValue = target[path]
  const updatedValue = updater(oldValue, path, { tail: true })

  if (!hasValue || oldValue !== updatedValue) {
    return Object.assign({}, target, { [path]: updatedValue })
  }

  return target
}

export const updateDeep = (target, path, updater, missingNodeResolver) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!isPlainObject(target)) {
      throw new Error(
        `target param is not valid. Expecting: object! Received: ${Object.prototype.toString.call(
          target
        )}.`
      )
    }

    if (!Array.isArray(path)) {
      throw new Error(
        `path param is not valid. Expecting: array! Received: ${Object.prototype.toString.call(
          path
        )}.`
      )
    }

    if (typeof updater !== 'function') {
      throw new Error(
        `updater param is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
          updater
        )}.`
      )
    }
  }

  let resolveMissingNode = missingNodeResolver || (() => ({}))
  let updated = Object.assign({}, target)
  let currentNode = updated
  let previousNode

  for (let i = 0, length = path.length; i < length; i++) {
    if (i === length - 1) {
      if (previousNode) {
        const updatedNode = update(currentNode, path[i], updater)

        if (currentNode === updatedNode) {
          return target
        }

        previousNode[path[i - 1]] = updatedNode
      } else {
        return update(target, path[i], updater)
      }
    } else {
      const oldOrMissingNode = currentNode[path[i]]
        ? currentNode[path[i]]
        : resolveMissingNode(path[i])
      const updatedNode = updater(oldOrMissingNode, path[i], { tail: false })

      currentNode[path[i]] = Object.assign({}, updatedNode)
      previousNode = currentNode
      currentNode = currentNode[path[i]]
    }
  }

  return updated
}
