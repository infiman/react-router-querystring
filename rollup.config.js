const path = require('path')
const { eslint } = require('rollup-plugin-eslint')
const replace = require('rollup-plugin-replace')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')
const { terser } = require('rollup-plugin-terser')

const { name } = require('./package.json')

const input = 'source/index.js'
const external = id =>
  !id.startsWith('.') && !id.includes(path.join(process.cwd(), 'source'))
const eslintOptions = options => ({
  throwOnError: process.env.NODE_ENV === 'production',
  throwOnWarning: process.env.NODE_ENV === 'production',
  ...options
})
const replaceOptions = options => ({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  ...options
})
const babelOptions = options => ({
  runtimeHelpers: true,
  exclude: /node_modules/,
  ...options
})
const nodeResolveOptions = options => ({
  extensions: ['.jsx', '.js', '.json'],
  ...options
})

module.exports = [
  {
    input,
    external,
    output: {
      name,
      file: `build/cjs/${name}${
        process.env.NODE_ENV === 'production' ? '.min' : ''
      }.js`,
      format: 'cjs',
      esModule: false
    },
    plugins: [
      eslint(eslintOptions()),
      replace(replaceOptions()),
      babel(babelOptions()),
      nodeResolve(nodeResolveOptions()),
      sizeSnapshot(),
      process.env.NODE_ENV === 'production' && terser()
    ].filter(Boolean)
  }
]
