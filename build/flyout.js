(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('helper.js'), require('lodash'), require('minivents')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'helper.js', 'lodash', 'minivents'], factory) :
    (factory((global.Flyout = global.Flyout || {}),global.$,global.helper,global._,global.Events));
}(this, (function (exports,$,helper_js,_,Events) { 'use strict';

$ = 'default' in $ ? $['default'] : $;
_ = 'default' in _ ? _['default'] : _;
Events = 'default' in Events ? Events['default'] : Events;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Yinxiong on 2016/1/2.
 */

var $window = $(window);
var $body = $(document.body);

/**
 * @constructor
 */

var Flyout = function () {
    function Flyout(element, options, props) {
        var _this = this;

        _classCallCheck(this, Flyout);

        Events(this);

        this._anchor = null;
        this._where = {};
        this._isHide = true;
        this._currentAnchor = null;
        this._currentAnchorBox = {};
        this._unbindDocument = null;

        this.setting = Object.assign({
            //隐藏时是否也清除对象
            destroy: false,
            //不会被全局隐藏，不会隐藏全局，独立存在
            alone: false,
            //点击其他位置是否隐藏
            clickDocumentHide: true,
            //点击同一个锚点时是否隐藏
            sameAnchorHide: true,
            //隐藏的方向
            hideDirect: 'default',
            //自动隐藏的停留时间
            stayTime: 0,
            //锚点悬停时是否持续显示
            anchorStay: false,
            //隐藏位置偏移量
            hideOffset: 10,
            //显示位置偏移量
            showOffset: 10,
            //动画时间
            showDuration: 150,
            easing: 'swing',
            classStyle: '',
            alignment: 'center',
            placement: 'top',
            arrow: true,
            stop: false,
            events: {}
        }, options);

        var flyoutModel = void 0;

        this.emit('created');

        if (typeof element == 'string') {
            //use template
            flyoutModel = Flyout.template[element];
            if (flyoutModel) {
                element = $(flyoutModel.element);
                this.setting = Object.assign({}, flyoutModel.options, options);
                //create element
            } else {
                element = $(element);
            }
            $body.append(element);
        } else {
            element = $(element);
        }

        if (element.attr('id') && !document.getElementById(element.attr('id'))) {
            $body.append(element);
        }

        if (props) {
            Object.assign(this, _.omit(props, Object.keys(this)));
        }

        if (element.data('flyout')) {
            return element.data('flyout');
        }

        element.data('flyout', this);

        this.primaryId = Flyout.primaryId++;

        Flyout.cache[this.primaryId] = this;

        _.forEach(this.setting.events, function (fn, name) {
            _this.on(name, fn.bind(_this));
        });

        this._baseFlyoutConstructor(element);
    }

    _createClass(Flyout, [{
        key: '_baseFlyoutConstructor',
        value: function _baseFlyoutConstructor(element) {

            //元素节点，可修改
            this.element = element;

            this.alone = this.setting.alone;

            //保存原始节点
            this._originalHTML = element.html();

            this.element.addClass('flyout').css({
                position: 'absolute'
            });

            if (this.setting.stop) {
                this.element.click(function (e) {
                    e.stopPropagation();
                });
            }
            if (this.setting.anchor) {
                this._anchor = this.setting.anchor;
            }
            this.element.addClass(this.setting.classStyle);

            //相对于冒点的位置[top, bottom,left, right ]
            //TODO 这里没有实现auto方法
            this._placement = this.setting.placement;
            //对齐方式[left, center, right ]，仅针对placement 为 top 或者 bottom
            this._alignment = this.setting.alignment;

            if (this.setting.arrow) {
                this._arrow = $('<span class="flyout-arrow"></span>');
                this.element.append(this._arrow);
            }

            this.emit('mounted');
        }
    }, {
        key: 'arrow',
        value: function arrow() {
            this._arrow = $('<span class="flyout-arrow"></span>');
            this.element.append(this._arrow);
        }
    }, {
        key: 'show',
        value: function show(anchor, placement, alignment, fixed) {
            this._baseFlyoutShow(anchor, placement, alignment, !!fixed);
        }

        //隐藏当前flyout对象

    }, {
        key: 'hide',
        value: function hide(immediately) {
            //一旦隐藏，就为document解除绑定的隐藏方法
            this._documentBind(true);
            this._baseFlyoutHide(immediately);
        }
    }, {
        key: 'position',
        value: function position() {
            var self = this;
            if (this._isHide) {
                return;
            }
            this._getTopLeft();
            this.setting.arrow && this._arrowPostion();
            this.element.animate(this._endPosition, {
                easing: this.setting.easing,
                duration: this.setting.showDuration,
                complete: function complete() {
                    self._isHide = false;
                }
            });
            return this;
        }
    }, {
        key: 'lastAnchor',
        value: function lastAnchor() {
            return this._currentAnchor;
        }

        //创建停留计时器

    }, {
        key: '_createStayTimer',
        value: function _createStayTimer() {
            var _this2 = this;

            if (this.setting.stayTime) {
                this._clearStay();
                this._stayTimer = helper_js.delay(function () {
                    _this2.hide();
                }, this.setting.stayTime + this.setting.showDuration);
            }
        }

        //清除计时器

    }, {
        key: '_clearStay',
        value: function _clearStay() {
            clearTimeout(this._stayTimer);
            this._stayTimer = null;
        }
    }, {
        key: '_documentBind',
        value: function _documentBind(unbind) {
            var _this3 = this;

            var self = this;
            if (this.setting.clickDocumentHide === false) {
                return;
            }
            if (unbind && this._unbindDocument) {
                this._unbindDocument();
                this._unbindDocument = null;
            } else if (!this._unbindDocument) {
                this._unbindDocument = helper_js.documentClick(this.element, function () {
                    if (_this3.setting.clickDocumentHide === true) {
                        _this3.hide();
                    } else if (typeof self.setting.clickDocumentHide == 'function') {
                        _this3.setting.clickDocumentHide.call(self);
                    }
                });
            }
        }

        //删除flyout对象

    }, {
        key: 'destroy',
        value: function destroy() {
            var id = this.primaryId;
            this.element.remove();
            Flyout.cache[id] = null;
            delete Flyout.cache[id];
        }

        //恢复flyout的原始html，这将情况此操作前所有对flyout的修改

    }, {
        key: 'recover',
        value: function recover() {
            this.element.html(this._originalHTML);
        }
    }, {
        key: '_arrowPostion',
        value: function _arrowPostion() {
            var arrow = this.element.find('span.flyout-arrow').attr('class', 'flyout-arrow');
            arrow.css({
                left: '',
                right: ''
            });

            var pos = void 0;
            switch (this._where.at) {
                case 'top':
                    pos = 'bottom';
                    break;
                case 'bottom':
                    pos = 'top';
                    break;
                case 'left':
                    pos = 'right';
                    break;
                case 'right':
                    pos = 'left';
                    break;
            }

            var offset = 0;

            if (this._currentAnchorBox.width <= 30) {
                offset = this._currentAnchorBox.width / 2;
            }

            if (this._currentAlignment == 'right') {
                this._startPosition.left += offset;
            } else if (this._currentAlignment == 'left') {
                this._startPosition.left -= offset + 9;
            }

            arrow.addClass(pos + ' ' + pos + '-' + this._currentAlignment);
        }
    }, {
        key: '_baseFlyoutShow',
        value: function _baseFlyoutShow(anchor, placement, alignment, fixed) {
            var _this4 = this;

            var self = this;
            var element = this.element;
            var sameAnchor = false;

            //动态更新锚点
            if (!anchor) {
                anchor = this._anchor;
            } else if (!anchor.jquery) {
                anchor = $(anchor);
            }
            //显示位置
            if (!placement) {
                placement = this._placement;
            }
            //对齐方式
            if (!alignment) {
                alignment = this._alignment;
            }

            if (!anchor) {
                return;
            } else {
                if (this._currentAnchor && this._currentAnchor[0] == anchor[0]) {
                    sameAnchor = true;
                }
                this._currentAnchor = anchor;
                this._currentPlacement = placement;
                this._currentAlignment = alignment;
            }

            Flyout.currentShowFlyout = this;

            if (anchor) {
                //获取flyout显示位置
                this._getTopLeft(fixed);
            }

            if (!this.alone) {
                this._hideAllVisibleFlyout();
            }

            //点击相同锚点是否隐藏
            if (sameAnchor && this.setting.sameAnchorHide && !this._isHide) {
                this.hide();
                //如果不是同一个锚点，或者同一个锚点却不可点，或者是同一个锚点可点但flyout是隐藏的
            } else if (!sameAnchor || sameAnchor && !this.setting.sameAnchorHide || sameAnchor && this.setting.sameAnchorHide && this._isHide) {

                //同一个flyout的不同手柄触发，要先移除之前的绑定事件， 但是要触发一次hide事件
                this._documentBind(true);

                //自动隐藏，信息提示用
                this._createStayTimer();
                this.setting.arrow && self._arrowPostion();

                element.show().css(this._startPosition).stop().animate(this._endPosition, {
                    easing: this.setting.easing,
                    duration: this.setting.showDuration,
                    complete: function complete() {
                        _this4._isHide = false;
                        _this4._documentBind();
                        _this4.emit('shown');
                    }
                });

                //当显示的时候调用
                this.emit('show');
            }
        }
    }, {
        key: '_baseFlyoutHide',
        value: function _baseFlyoutHide(immediately) {

            this._clearStay();

            var self = this;
            var _hidePosition = { opacity: 0 };
            var hideOffset = this.setting.hideOffset;
            switch (this._where.at) {
                case 'bottom':
                    _hidePosition.top = this.element.offset().top + hideOffset;
                    break;
                case 'top':
                    _hidePosition.top = this.element.offset().top - hideOffset;
                    break;
                case 'left':
                    _hidePosition.left = this.element.offset().left - hideOffset;
                    break;
                case 'right':
                    _hidePosition.left = this.element.offset().left + hideOffset;
                    break;
                default:
                    break;
            }

            if (immediately === true) {
                self._hideElement();
            } else {
                this.element.stop().animate(_hidePosition, {
                    easing: this.setting.easing,
                    duration: 160,
                    complete: function complete() {
                        self._hideElement();
                    }
                });
            }

            //当隐藏时调用
            this.emit('hide');
        }
    }, {
        key: '_hideElement',
        value: function _hideElement() {
            this.element.hide();
            this._isHide = true;
            this.emit('hidden');
            if (this.setting.destroy) {
                this.destroy();
            }
        }

        //隐藏除自己之外的所有flyout

    }, {
        key: '_hideAllVisibleFlyout',
        value: function _hideAllVisibleFlyout() {
            var currentId = this.primaryId;
            $.each(Flyout.cache, function (id, flyout) {
                if (flyout && currentId != id && !flyout._isHide && !flyout.alone) {
                    flyout.hide();
                }
            });
        }

        //获取位置坐标

    }, {
        key: '_getTopLeft',
        value: function _getTopLeft(fixed) {
            var currentAnchor = this._currentAnchor;
            var anchor = this._currentAnchorBox = {
                left: currentAnchor.offset().left,
                right: currentAnchor.offset().left + currentAnchor.outerWidth(),
                top: currentAnchor.offset().top,
                bottom: currentAnchor.offset().top + currentAnchor.outerHeight(),
                width: currentAnchor.outerWidth(),
                height: currentAnchor.outerHeight()
            },
                element = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };

            this._currentScrollTop = $window.scrollTop();
            this._startPosition = { opacity: 0 };
            this._endPosition = { opacity: 1 };

            switch (this._currentPlacement) {
                case 'top':
                    this._where.at = 'top';
                    if (!this._fitTop(anchor, element) && !fixed) {
                        this._fitBottom(anchor, element);
                        this._where.at = 'bottom';
                    }
                    this._alignHorizontally(anchor, element);
                    break;
                case 'bottom':
                    this._where.at = 'bottom';
                    if (!this._fitBottom(anchor, element) && !fixed) {
                        this._fitTop(anchor, element);
                        this._where.at = 'top';
                    }
                    this._alignHorizontally(anchor, element);
                    break;
                case 'left':
                    this._where.at = 'left';
                    if (!this._fitLeft(anchor, element) && !fixed) {
                        // Didn't fit, needs scrollbar
                        this._fitRight(anchor, element);
                        this._where.at = 'right';
                    }
                    this._alignVertically(anchor, element);
                    break;
                case 'right':
                    this._where.at = 'right';
                    if (!this._fitRight(anchor, element) && !fixed) {
                        // Didn't fit, needs scrollbar
                        this._fitLeft(anchor, element);
                        this._where.at = 'left';
                    }
                    this._alignVertically(anchor, element);
                    break;
                case 'auto':
                    break;
            }
        }

        //是否适合上面

    }, {
        key: '_fitTop',
        value: function _fitTop(anchorDimension, flyoutDimension) {
            this._nextTop = anchorDimension.top - flyoutDimension.height;
            this._nextAnimTop = this._nextTop - this.setting.showOffset;
            return this._nextTop >= 0 && this._nextAnimTop > this._currentScrollTop && this._nextAnimTop + flyoutDimension.height < anchorDimension.top;
        }

        //是否适合下面

    }, {
        key: '_fitBottom',
        value: function _fitBottom(anchorDimension, flyoutDimension) {
            this._nextTop = anchorDimension.bottom;
            this._nextAnimTop = anchorDimension.bottom + this.setting.showOffset;
            return this._nextTop >= 0 && this._nextAnimTop - this._currentScrollTop + flyoutDimension.height < $window.height();
        }

        //是否适合左边

    }, {
        key: '_fitLeft',
        value: function _fitLeft(anchorDimension, flyoutDimension) {
            this._nextLeft = anchorDimension.left - flyoutDimension.width + this.setting.showOffset;
            this._nextAnimLeft = this._nextLeft - this.setting.showOffset * 2;
            return this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width();
        }

        //是否适合右边

    }, {
        key: '_fitRight',
        value: function _fitRight(anchorDimension, flyoutDimension) {
            this._nextLeft = anchorDimension.right - this.setting.showOffset;
            this._nextAnimLeft = this._nextLeft + this.setting.showOffset * 2;
            return this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width();
        }

        //是否适合居左

    }, {
        key: '_fitAlignLeft',
        value: function _fitAlignLeft(anchorDimension, flyoutDimension) {
            this._nextLeft = anchorDimension.left;
            return anchorDimension.left + flyoutDimension.width < $window.width();
        }

        //是否适合居右

    }, {
        key: '_fitAlignRight',
        value: function _fitAlignRight(anchorDimension, flyoutDimension) {
            this._nextLeft = anchorDimension.right - flyoutDimension.width;
            return anchorDimension.right > flyoutDimension.width;
        }

        //纵向对齐

    }, {
        key: '_alignVertically',
        value: function _alignVertically(anchorDimension, flyoutDimension) {
            if (this._currentAlignment == 'center') {
                this._nextTop = anchorDimension.top + anchorDimension.height / 2 - flyoutDimension.height / 2;
            } else if (this._currentAlignment == 'top') {
                this._nextTop = anchorDimension.top;
            } else if (this._currentAlignment == 'bottom') {
                this._nextTop = anchorDimension.bottom - flyoutDimension.height;
            }

            this._startPosition.top = this._nextTop;
            this._startPosition.left = this._nextLeft;
            this._endPosition.left = this._nextAnimLeft;
        }

        //横向对齐方式

    }, {
        key: '_alignHorizontally',
        value: function _alignHorizontally(anchorDimension, flyoutDimension) {

            var width = $window.width();

            if (this._currentAlignment == 'center') {
                this._nextLeft = anchorDimension.left + anchorDimension.width / 2 - flyoutDimension.width / 2;

                if (this._nextLeft + flyoutDimension.width > width) {
                    this._currentAlignment = 'right';
                } else if (this._nextLeft < 0) {
                    this._currentAlignment = 'left';
                }
            }

            if (this._currentAlignment == 'left' && !this._fitAlignLeft(anchorDimension, flyoutDimension)) {
                this._fitAlignRight(anchorDimension, flyoutDimension);
                this._currentAlignment = 'right';
            } else if (this._currentAlignment == 'right' && !this._fitAlignRight(anchorDimension, flyoutDimension)) {
                this._fitAlignLeft(anchorDimension, flyoutDimension);
                this._currentAlignment = 'left';
            }

            this._startPosition.left = this._nextLeft;
            this._startPosition.top = this._nextTop;
            this._endPosition.top = this._nextAnimTop;
        }
    }], [{
        key: 'hideAllFlyout',
        value: function hideAllFlyout() {
            $('.flyout:visible').each(function () {
                var $this = $(this),
                    flyoutControl = $this.data('flyout');
                if (flyoutControl && $this.is(':visible')) {
                    flyoutControl.hide();
                }
            });
        }
    }, {
        key: 'template',
        get: function get() {
            return {
                base: {
                    element: '<div class="flyout box"><div class="mod"><div class="bd"></div><div class="ft"></div></div></div>'
                }
            };
        }
    }]);

    return Flyout;
}();

Flyout.primaryId = 0;
Flyout.cache = {};
//只能聚焦一个flyout对象
Flyout.currentShowFlyout = null;

/**
 * Created by Yinxiong on 2016/1/2.
 */

var confirm = function (anchor) {
    var ok = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : helper_js.noop;
    var html = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';


    var tpl = '\n\t\t<div class="flyout-box flyout-confirm">\n\t\t\t<p class="text"></p>\n\t\t\t<div class="buttons">\n\t\t\t\t<button role="cancel" class="btn btn-sm btn-secondary">\u53D6\u6D88</button>\n\t\t\t\t<button role="ok" class="btn btn-sm btn-primary">\u786E\u8BA4</button>\n\t\t\t</div>\n\t\t</div>';

    var flyout = new Flyout(tpl, {
        destroy: true,
        events: {
            mounted: function mounted() {
                var _this = this;

                this.element.on('click', 'button[role]', function (e) {
                    var type = $(e.target).attr('role');
                    if (type == 'ok') {
                        ok.call(_this);
                    }
                    _this.hide();
                });
            }
        }
    });

    var text = flyout.element.find('p.text');

    if (html) {
        text.css('width', 'auto').show().html(html);
        if (flyout.element.outerWidth() > 300) {
            text.width('250');
        }
    } else {
        text.hide().html('');
    }

    flyout.show(anchor, 'top', 'center');

    return flyout;
};

/**
 * Created by Yinxiong on 2016/1/2.
 */

var tips = function (anchor, html, options) {
    anchor = $(anchor);

    var flyout = anchor.data('flyout');

    if (flyout == null) {
        var setting = {
            placement: 'top',
            alignment: 'center',
            destroy: true,
            stayTime: 800,
            classStyle: 'info',
            events: {
                hidden: function hidden() {
                    anchor.data('flyout', null);
                }
            }
        };

        if (typeof options == 'string' && options.length) {
            setting.classStyle = 'alert-' + options;
        } else if ($.isPlainObject(options) || typeof options == 'undefined') {
            Object.assign(setting, options);
            if (setting.classStyle.length) {
                setting.classStyle = 'alert-' + setting.classStyle;
            }
        }

        flyout = new Flyout('<div class="flyout-tips alert"></div>', setting);
        flyout.element.html(html).mouseenter(function () {
            anchor.data('flyout', flyout);
            flyout._clearStay();
        }).mouseleave(function () {
            anchor.data('flyout', null);
            flyout._createStayTimer();
        });
        flyout.arrow();
        flyout.show(anchor);
    }

    return flyout;
};

/**
 * Created by Yinxiong on 2016/11/20.
 */

exports.confirm = confirm;
exports.tips = tips;
exports['default'] = Flyout;

Object.defineProperty(exports, '__esModule', { value: true });

})));
