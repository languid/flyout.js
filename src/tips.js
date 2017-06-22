/**
 * Created by Yinxiong on 2016/1/2.
 */

import Flyout from './flyout'
import $ from 'jquery'

export default function (anchor, html, options) {
  anchor = $(anchor)

  let flyout = anchor.data('flyout')

  if (flyout === null) {
    const setting = {
      placement: 'top',
      alignment: 'center',
      destroy: true,
      stayTime: 800,
      classStyle: 'info',
      events: {
        hidden () {
          anchor.data('flyout', null)
        }
      }
    }

    if (typeof options === 'string' && options.length) {
      setting.classStyle = 'alert-' + options
    } else if ($.isPlainObject(options) || typeof options === 'undefined') {
      Object.assign(setting, options)
      if (setting.classStyle.length) {
        setting.classStyle = 'alert-' + setting.classStyle
      }
    }

    flyout = new Flyout('<div class="flyout-tips alert"></div>', setting)
    flyout.element.html(html).mouseenter(function () {
      anchor.data('flyout', flyout)
      flyout._clearStay()
    }).mouseleave(function () {
      anchor.data('flyout', null)
      flyout._createStayTimer()
    })
    flyout.arrow()
    flyout.show(anchor)
  }

  return flyout
}

