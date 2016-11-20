/**
 * Created by Yinxiong on 2016/11/20.
 */

import babel from 'rollup-plugin-babel';
import node from 'rollup-plugin-node-resolve';

export default {
    entry: './index.js',
    dest: 'dist/flyout.js',
    format: 'umd',
    moduleName: 'Flyout',
    plugins: [node(), babel({
        exclude: [
            ''
        ]
    })]
};