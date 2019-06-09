const { eslint } = require('rollup-plugin-eslint')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')

const { name, dependencies } = require('./package.json')

module.exports = {
  input: 'source/index.js',
  external: id =>
    Object.keys(dependencies).some(dependency => id.includes(dependency)),
  output: {
    name,
    file: `build/cjs/${name}.js`,
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
