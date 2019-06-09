const { eslint } = require('rollup-plugin-eslint')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')

const { name } = require('./package.json')

module.exports = {
  input: 'source/index.js',
  external: RegExp.prototype.test.bind(/node_modules/),
  output: {
    name,
    file: `build/${name.split('/')[1]}.cjs.js`,
    format: 'cjs',
    esModule: false
  },
  plugins: [
    eslint(),
    babel({
      runtimeHelpers: true,
      exclude: /node_modules/
    }),
    nodeResolve()
  ]
}
