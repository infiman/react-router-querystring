import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'

import { dependencies } from './package.json'

export default {
  input: './source/index.js',
  external: Object.keys(dependencies),
  output: {
    file: './build/bundle.js',
    format: 'cjs'
  },
  plugins: [commonjs(), nodeResolve(), eslint()]
}
