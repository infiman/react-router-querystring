export const parsePathname = pathname => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof pathname !== 'string') {
      throw new Error(
        `pathname param is not valid. Expected: string! Received: ${Object.prototype.toString.call(
          pathname
        )}.`
      )
    }
  }

  const [dirty, ...splitPathname] = pathname.split('/')

  if (process.env.NODE_ENV !== 'production') {
    if (dirty || !splitPathname.length) {
      throw new Error(
        `pathname param is not valid. Expected: '/'! Received: ${pathname}.`
      )
    }
  }

  if (!splitPathname[0]) {
    splitPathname[0] = '/'
  }

  return splitPathname
}
