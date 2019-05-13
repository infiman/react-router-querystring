export const parsePathname = pathname => {
  if (typeof pathname !== 'string') {
    throw new Error(
      `Pathname is not valid. Expected: string! Received: ${Object.prototype.toString.call(
        pathname
      )}.`
    )
  }

  const [dirty, ...splitPathname] = pathname.split('/')

  if (dirty || !splitPathname.length) {
    throw new Error("Pathname is not valid. It should start with '/'!")
  }

  if (!splitPathname[0]) {
    splitPathname[0] = '/'
  }

  return splitPathname
}
