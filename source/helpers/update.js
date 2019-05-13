import { isPlainObject } from './isPlainObject'

export const update = (target, path, updater) => {
  if (!isPlainObject(target)) {
    throw new Error(
      "Target is not a plain object. Can't update a not 'plain object like' structure!"
    )
  }

  if (!path || typeof path !== 'string') {
    throw new Error(
      `Path is not valid. Expecting: string! Received: ${Object.prototype.toString.call(
        path
      )}.`
    )
  }

  if (!updater || typeof updater !== 'function') {
    throw new Error(
      `Updater is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
        updater
      )}.`
    )
  }

  const hasValue = Object.prototype.hasOwnProperty.call(target, path)
  const oldValue = target[path]
  const newValue = updater(oldValue, path)

  if (!hasValue || oldValue !== newValue) {
    return Object.assign({}, target, { [path]: newValue })
  }

  return target
}

export const updateDeep = (target, path, updater) => {
  if (!isPlainObject(target)) {
    throw new Error(
      "Target is not a plain object. Can't update a not 'plain object like' structure!"
    )
  }

  if (!path || !Array.isArray(path)) {
    throw new Error(
      `Path is not valid. Expecting: array! Received: ${Object.prototype.toString.call(
        path
      )}.`
    )
  }

  if (!updater || typeof updater !== 'function') {
    throw new Error(
      `Updater is not valid. Expecting: function! Received: ${Object.prototype.toString.call(
        updater
      )}.`
    )
  }

  let updated = Object.assign({}, target)
  let currentNode = updated
  let previousNode

  for (let i = 0, length = path.length; i < length; i++) {
    if (i === length - 1) {
      if (previousNode) {
        const newNode = update(currentNode, path[i], updater)

        if (currentNode === newNode) {
          return target
        }

        previousNode[path[i - 1]] = newNode
      } else {
        return update(target, path[i], updater)
      }
    } else {
      currentNode[path[i]] = Object.assign({}, currentNode[path[i]])
      previousNode = currentNode
      currentNode = currentNode[path[i]]
    }
  }

  return updated
}
