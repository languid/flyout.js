/**
 * Created by Yinxiong on 2016/1/2.
 */

import $ from 'jquery'
import { delay, documentClick } from 'helper.js'
import Events from 'minivents'
import { install } from './install'

const $window = $(window)
const $body = $(document.body)

export default class Flyout {
  constructor (element, options) {
    Events(this)

    this._anchor = null
    this._where = {}
    this._isHide = true
    this._currentAnchor = null
    this._currentAnchorBox = {}
    this._unbindDocument = null

    this.setting = Object.assign({
            // 隐藏时是否也清除对象
      destroy: false,
            // 不会被全局隐藏，不会隐藏全局，独立存在
      alone: false,
            // 点击其他位置是否隐藏
      clickDocumentHide: true,
            // 点击同一个锚点时是否隐藏
      sameAnchorHide: true,
            // 隐藏的方向
      hideDirect: 'default',
            // 自动隐藏的停留时间
      stayTime: 0,
            // 锚点悬停时是否持续显示
      anchorStay: false,
            // 隐藏位置偏移量
      hideOffset: 10,
            // 显示位置偏移量
      showOffset: 10,
            // 动画时间
      showDuration: 150,
      easing: 'swing',
      classStyle: '',
      alignment: 'center',
      placement: 'top',
      arrow: true,
      stop: false,
      events: {}
    }, options)

    let flyoutModel

    this.emit('created')

    if (typeof element === 'string') {
            // use template
      flyoutModel = Flyout.template[element]
      if (flyoutModel) {
        element = $(flyoutModel.element)
        this.setting = Object.assign({}, flyoutModel.options, options)
                // create element
      } else {
        element = $(element)
      }
      $body.append(element)
    } else {
      element = $(element)
    }

    if (element.attr('id') && !document.getElementById(element.attr('id'))) {
      $body.append(element)
    }

    if (element.data('flyout')) {
      return element.data('flyout')
    }

    element.data('flyout', this)

    this.primaryId = Flyout.primaryId++

    Flyout.cache[this.primaryId] = this

    for (const name of this.setting.events) {
      this.on(name, this.setting.events[name].bind(this))
    }

    this._baseFlyoutConstructor(element)
  }

  _baseFlyoutConstructor (element) {
        // 元素节点，可修改
    this.element = element

    this.alone = this.setting.alone

        // 保存原始节点
    this._originalHTML = element.html()

    this.element.addClass('flyout').css({
      position: 'absolute'
    })

    if (this.setting.stop) {
      this.element.click(function (e) {
        e.stopPropagation()
      })
    }
    if (this.setting.anchor) {
      this._anchor = this.setting.anchor
    }
    this.element.addClass(this.setting.classStyle)

        // 相对于冒点的位置[top, bottom,left, right ]
        // TODO 这里没有实现auto方法
    this._placement = this.setting.placement
        // 对齐方式[left, center, right ]，仅针对placement 为 top 或者 bottom
    this._alignment = this.setting.alignment

    if (this.setting.arrow) {
      this._arrow = $('<span class="flyout-arrow"></span>')
      this.element.append(this._arrow)
    }

    this.emit('mounted')
  }

  arrow () {
    this._arrow = $('<span class="flyout-arrow"></span>')
    this.element.append(this._arrow)
  }

  show (anchor, placement, alignment, fixed) {
    this._baseFlyoutShow(anchor, placement, alignment, !!fixed)
  }

    // 隐藏当前flyout对象
  hide (immediately) {
        // 一旦隐藏，就为document解除绑定的隐藏方法
    this._documentBind(true)
    this._baseFlyoutHide(immediately)
  }

  position () {
    const self = this
    if (this._isHide) {
      return
    }
    this._getTopLeft()
    this.setting.arrow && this._arrowPostion()
    this.element.animate(this._endPosition, {
      easing: this.setting.easing,
      duration: this.setting.showDuration,
      complete () {
        self._isHide = false
      }
    })
    return this
  }

  lastAnchor () {
    return this._currentAnchor
  }

    // 创建停留计时器
  _createStayTimer () {
    if (this.setting.stayTime) {
      this._clearStay()
      this._stayTimer = delay(() => {
        this.hide()
      }, this.setting.stayTime + this.setting.showDuration)
    }
  }

    // 清除计时器
  _clearStay () {
    clearTimeout(this._stayTimer)
    this._stayTimer = null
  }

  _documentBind (unbind) {
    const self = this
    if (this.setting.clickDocumentHide === false) {
      return
    }
    if (unbind && this._unbindDocument) {
      this._unbindDocument()
      this._unbindDocument = null
    } else if (!this._unbindDocument) {
      this._unbindDocument = documentClick(this.element, () => {
        if (this.setting.clickDocumentHide === true) {
          this.hide()
        } else if (typeof self.setting.clickDocumentHide === 'function') {
          this.setting.clickDocumentHide.call(self)
        }
      })
    }
  }

    // 删除flyout对象
  destroy () {
    const id = this.primaryId
    this.element.remove()
    Flyout.cache[id] = null
    delete Flyout.cache[id]
  }

    // 恢复flyout的原始html，这将情况此操作前所有对flyout的修改
  recover () {
    this.element.html(this._originalHTML)
  }

  _arrowPostion () {
    const arrow = this.element.find('span.flyout-arrow').attr('class', 'flyout-arrow')
    arrow.css({
      left: '',
      right: ''
    })

    let pos
    switch (this._where.at) {
      case 'top':
        pos = 'bottom'
        break
      case 'bottom':
        pos = 'top'
        break
      case 'left':
        pos = 'right'
        break
      case 'right':
        pos = 'left'
        break
    }

    let offset = 0

    if (this._currentAnchorBox.width <= 30) {
      offset = this._currentAnchorBox.width / 2
    }

    if (this._currentAlignment === 'right') {
      this._startPosition.left += offset
    } else if (this._currentAlignment === 'left') {
      this._startPosition.left -= offset + 9
    }

    arrow.addClass(pos + ' ' + pos + '-' + this._currentAlignment)
  }

  _baseFlyoutShow (anchor, placement, alignment, fixed) {
    const self = this
    const element = this.element
    let sameAnchor = false

        // 动态更新锚点
    if (!anchor) {
      anchor = this._anchor
    } else if (!anchor.jquery) {
      anchor = $(anchor)
    }
        // 显示位置
    if (!placement) {
      placement = this._placement
    }
        // 对齐方式
    if (!alignment) {
      alignment = this._alignment
    }

    if (!anchor) {
      return
    } else {
      if (this._currentAnchor && this._currentAnchor[0] === anchor[0]) {
        sameAnchor = true
      }
      this._currentAnchor = anchor
      this._currentPlacement = placement
      this._currentAlignment = alignment
    }

    Flyout.currentShowFlyout = this

    if (anchor) {
            // 获取flyout显示位置
      this._getTopLeft(fixed)
    }

    if (!this.alone) {
      this._hideAllVisibleFlyout()
    }

        // 点击相同锚点是否隐藏
    if (sameAnchor && this.setting.sameAnchorHide && !this._isHide) {
      this.hide()
            // 如果不是同一个锚点，或者同一个锚点却不可点，或者是同一个锚点可点但flyout是隐藏的
    } else if (!sameAnchor || (sameAnchor && !this.setting.sameAnchorHide) || (sameAnchor && this.setting.sameAnchorHide && this._isHide)) {
            // 同一个flyout的不同手柄触发，要先移除之前的绑定事件， 但是要触发一次hide事件
      this._documentBind(true)

            // 自动隐藏，信息提示用
      this._createStayTimer()
      this.setting.arrow && self._arrowPostion()

      element.show()
                .css(this._startPosition)
                .stop()
                .animate(this._endPosition, {
                  easing: this.setting.easing,
                  duration: this.setting.showDuration,
                  complete: () => {
                    this._isHide = false
                    this._documentBind()
                    this.emit('shown')
                  }
                })

            // 当显示的时候调用
      this.emit('show')
    }
  }

  _baseFlyoutHide (immediately) {
    this._clearStay()

    const self = this
    const _hidePosition = { opacity: 0 }
    const hideOffset = this.setting.hideOffset
    switch (this._where.at) {
      case 'bottom':
        _hidePosition.top = this.element.offset().top + hideOffset
        break
      case 'top':
        _hidePosition.top = this.element.offset().top - hideOffset
        break
      case 'left':
        _hidePosition.left = this.element.offset().left - hideOffset
        break
      case 'right':
        _hidePosition.left = this.element.offset().left + hideOffset
        break
      default:
        break
    }

    if (immediately === true) {
      self._hideElement()
    } else {
      this.element.stop().animate(_hidePosition, {
        easing: this.setting.easing,
        duration: 160,
        complete: function () {
          self._hideElement()
        }
      })
    }

        // 当隐藏时调用
    this.emit('hide')
  }

  _hideElement () {
    this.element.hide()
    this._isHide = true
    this.emit('hidden')
    if (this.setting.destroy) {
      this.destroy()
    }
  }

    // 隐藏除自己之外的所有flyout
  _hideAllVisibleFlyout () {
    const currentId = this.primaryId
    $.each(Flyout.cache, function (id, flyout) {
      if (flyout && currentId !== id && !flyout._isHide && !flyout.alone) {
        flyout.hide()
      }
    })
  }

    // 获取位置坐标
  _getTopLeft (fixed) {
    const currentAnchor = this._currentAnchor
    const anchor = this._currentAnchorBox = {
      left: currentAnchor.offset().left,
      right: currentAnchor.offset().left + currentAnchor.outerWidth(),
      top: currentAnchor.offset().top,
      bottom: currentAnchor.offset().top + currentAnchor.outerHeight(),
      width: currentAnchor.outerWidth(),
      height: currentAnchor.outerHeight()
    }
    const element = {
      width: this.element.outerWidth(),
      height: this.element.outerHeight()
    }

    this._currentScrollTop = $window.scrollTop()
    this._startPosition = { opacity: 0 }
    this._endPosition = { opacity: 1 }

    switch (this._currentPlacement) {
      case 'top':
        this._where.at = 'top'
        if (!this._fitTop(anchor, element) && !fixed) {
          this._fitBottom(anchor, element)
          this._where.at = 'bottom'
        }
        this._alignHorizontally(anchor, element)
        break
      case 'bottom':
        this._where.at = 'bottom'
        if (!this._fitBottom(anchor, element) && !fixed) {
          this._fitTop(anchor, element)
          this._where.at = 'top'
        }
        this._alignHorizontally(anchor, element)
        break
      case 'left':
        this._where.at = 'left'
        if (!this._fitLeft(anchor, element) && !fixed) {
                // Didn't fit, needs scrollbar
          this._fitRight(anchor, element)
          this._where.at = 'right'
        }
        this._alignVertically(anchor, element)
        break
      case 'right':
        this._where.at = 'right'
        if (!this._fitRight(anchor, element) && !fixed) {
                // Didn't fit, needs scrollbar
          this._fitLeft(anchor, element)
          this._where.at = 'left'
        }
        this._alignVertically(anchor, element)
        break
      case 'auto':
        break
    }
  }

    // 是否适合上面
  _fitTop (anchorDimension, flyoutDimension) {
    this._nextTop = anchorDimension.top - flyoutDimension.height
    this._nextAnimTop = this._nextTop - this.setting.showOffset
    return (this._nextTop >= 0 && this._nextAnimTop > this._currentScrollTop && this._nextAnimTop + flyoutDimension.height < anchorDimension.top)
  }

    // 是否适合下面
  _fitBottom (anchorDimension, flyoutDimension) {
    this._nextTop = anchorDimension.bottom
    this._nextAnimTop = anchorDimension.bottom + this.setting.showOffset
    return (this._nextTop >= 0 && this._nextAnimTop - this._currentScrollTop + flyoutDimension.height < $window.height())
  }

    // 是否适合左边
  _fitLeft (anchorDimension, flyoutDimension) {
    this._nextLeft = anchorDimension.left - flyoutDimension.width + this.setting.showOffset
    this._nextAnimLeft = this._nextLeft - this.setting.showOffset * 2
    return (this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width())
  }

    // 是否适合右边
  _fitRight (anchorDimension, flyoutDimension) {
    this._nextLeft = anchorDimension.right - this.setting.showOffset
    this._nextAnimLeft = this._nextLeft + this.setting.showOffset * 2
    return (this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width())
  }

    // 是否适合居左
  _fitAlignLeft (anchorDimension, flyoutDimension) {
    this._nextLeft = anchorDimension.left
    return anchorDimension.left + flyoutDimension.width < $window.width()
  }

    // 是否适合居右
  _fitAlignRight (anchorDimension, flyoutDimension) {
    this._nextLeft = anchorDimension.right - flyoutDimension.width
    return anchorDimension.right > flyoutDimension.width
  }

    // 纵向对齐
  _alignVertically (anchorDimension, flyoutDimension) {
    if (this._currentAlignment === 'center') {
      this._nextTop = anchorDimension.top + anchorDimension.height / 2 - flyoutDimension.height / 2
    } else if (this._currentAlignment === 'top') {
      this._nextTop = anchorDimension.top
    } else if (this._currentAlignment === 'bottom') {
      this._nextTop = anchorDimension.bottom - flyoutDimension.height
    }

    this._startPosition.top = this._nextTop
    this._startPosition.left = this._nextLeft
    this._endPosition.left = this._nextAnimLeft
  }

    // 横向对齐方式
  _alignHorizontally (anchorDimension, flyoutDimension) {
    const width = $window.width()

    if (this._currentAlignment === 'center') {
      this._nextLeft = anchorDimension.left + anchorDimension.width / 2 - flyoutDimension.width / 2

      if (this._nextLeft + flyoutDimension.width > width) {
        this._currentAlignment = 'right'
      } else if (this._nextLeft < 0) {
        this._currentAlignment = 'left'
      }
    }

    if (this._currentAlignment === 'left' && !this._fitAlignLeft(anchorDimension, flyoutDimension)) {
      this._fitAlignRight(anchorDimension, flyoutDimension)
      this._currentAlignment = 'right'
    } else if (this._currentAlignment === 'right' && !this._fitAlignRight(anchorDimension, flyoutDimension)) {
      this._fitAlignLeft(anchorDimension, flyoutDimension)
      this._currentAlignment = 'left'
    }

    this._startPosition.left = this._nextLeft
    this._startPosition.top = this._nextTop
    this._endPosition.top = this._nextAnimTop
  }

  static hideAllFlyout () {
    $('.flyout:visible').each(function () {
      const $this = $(this)
      const flyoutControl = $this.data('flyout')
      if (flyoutControl && $this.is(':visible')) {
        flyoutControl.hide()
      }
    })
  }

  static get template () {
    return {
      base: {
        element: '<div class="flyout box"><div class="mod"><div class="bd"></div><div class="ft"></div></div></div>'
      }
    }
  }
}

Flyout.primaryId = 0
Flyout.cache = {}
// 只能聚焦一个flyout对象
Flyout.currentShowFlyout = null
Flyout.install = install
