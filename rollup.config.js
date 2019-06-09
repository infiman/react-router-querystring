const { eslint } = require('rollup-plugin-eslint')
const replace = require('rollup-plugin-replace')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')
const { terser } = require('rollup-plugin-terser')

const { name, dependencies, peerDependencies } = require('./package.json')

const allDependencies = [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies)
]
const input = 'source/index.js'
const external = id =>
  allDependencies.some(dependency => id.includes(dependency))
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
      file: `build/cjs/${name}.js`,
      format: 'cjs',
      esModule: false
    },
    plugins: [
      eslint(eslintOptions()),
      replace(replaceOptions()),
      babel(babelOptions()),
      nodeResolve(nodeResolveOptions()),
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
      replace(replaceOptions()),
      babel(babelOptions()),
      nodeResolve(nodeResolveOptions()),
      terser()
    ]
  }
].filter(Boolean)
