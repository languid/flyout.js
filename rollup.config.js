/**
 * Created by Yinxiong on 2016/11/20.
 */

import babel from 'rollup-plugin-babel';

export default {
    entry: 'index.js',
    dest: 'build/flyout.js',
    moduleName: 'Flyout',
    format: 'umd',
    external: ['minivents', 'jquery', 'lodash', 'helper.js'],
    globals: {
        minivents: 'Events',
        jquery: '$',
        lodash: '_',
        'helper.js': 'helper'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};