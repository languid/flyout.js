/**
 * Created by Yinxiong on 2016/1/2.
 */

import Flyout from './flyout'
import { install } from './install'

Flyout.install = install
Flyout.version = '__VERSION__'

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Flyout)
}

export default Flyout
