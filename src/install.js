/**
 * Created by Yinxiong on 2017/6/19.
 */

import VueFlyout from './views/flyout'

export function install (Vue) {
  if (install.installed) return
  install.installed = true

  Vue.component('flyout', VueFlyout)
}
