/**
 * Created by Yinxiong on 2016/11/20.
 */

import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'

export default {
  entry: 'src/index.js',
  dest: 'build/flyout.js',
  moduleName: 'Flyout',
  format: 'umd',
  external: ['minivents', 'jquery', 'helper.js'],
  globals: {
    minivents: 'Events',
    jquery: '$',
    'helper.js': 'helper'
  },
  plugins: [
    vue(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
