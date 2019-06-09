const { eslint } = require('rollup-plugin-eslint')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')
const { terser } = require('rollup-plugin-terser')

const { name, dependencies } = require('./package.json')

const input = 'source/index.js'
const external = id =>
  Object.keys(dependencies).some(dependency => id.includes(dependency))
const eslintOptions = options => ({
  throwOnError: process.env.NODE_ENV === 'production',
  throwOnWarning: process.env.NODE_ENV === 'production',
  ...options
})
const babelOptions = options => ({
  runtimeHelpers: true,
  exclude: /node_modules/,
  ...options
})

module.exports = [
  {
    input,
    external,
    output: {
      name,
      file: `build/cjs/${name}.js`,
      format: 'cjs',
      esModule: false
    },
    plugins: [
      eslint(eslintOptions()),
      babel(babelOptions()),
      nodeResolve(),
      sizeSnapshot()
    ]
  },
  process.env.NODE_ENV === 'production' && {
    input,
    external,
    output: {
      name,
      file: `build/cjs/${name}.min.js`,
      format: 'cjs',
      esModule: false
    },
    plugins: [
      eslint(eslintOptions()),
      babel(babelOptions()),
      nodeResolve(),
      terser()
    ]
  }
].filter(Boolean)
