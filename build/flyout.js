(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('helper.js'), require('minivents')) :
	typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'helper.js', 'minivents'], factory) :
	(factory((global.Flyout = global.Flyout || {}),global.$,global.helper,global.Events));
}(this, (function (exports,$,helper_js,Events) { 'use strict';

$ = $ && 'default' in $ ? $['default'] : $;
Events = Events && 'default' in Events ? Events['default'] : Events;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $window = $(window);
var $body = $(document.body);

var Flyout$1 = function () {
  function Flyout(element, options) {
    _classCallCheck(this, Flyout);

    Events(this);

    this._anchor = null;
    this._where = {};
    this._isHide = true;
    this._currentAnchor = null;
    this._currentAnchorBox = {};
    this._unbindDocument = null;

    this.setting = Object.assign({
      destroy: false,

      alone: false,

      clickDocumentHide: true,

      sameAnchorHide: true,

      hideDirect: 'default',

      stayTime: 0,

      anchorStay: false,

      hideOffset: 10,

      showOffset: 10,

      showDuration: 150,
      easing: 'swing',
      classStyle: '',
      alignment: 'center',
      placement: 'top',
      arrow: true,
      stop: false
    }, options);

    var flyoutModel = void 0;

    this.emit('created');

    if (typeof element === 'string') {
      flyoutModel = Flyout.template[element];
      if (flyoutModel) {
        element = $(flyoutModel.element);
        this.setting = Object.assign({}, flyoutModel.options, options);
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

    if (element.data('flyout')) {
      return element.data('flyout');
    }

    element.data('flyout', this);

    this.primaryId = Flyout.primaryId++;

    Flyout.cache[this.primaryId] = this;

    this._baseFlyoutConstructor(element);
  }

  _createClass(Flyout, [{
    key: '_baseFlyoutConstructor',
    value: function _baseFlyoutConstructor(element) {
      this.element = element;

      this.alone = this.setting.alone;

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

      this._placement = this.setting.placement;

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
  }, {
    key: 'hide',
    value: function hide(immediately) {
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
  }, {
    key: '_createStayTimer',
    value: function _createStayTimer() {
      var _this = this;

      if (this.setting.stayTime) {
        this._clearStay();
        this._stayTimer = helper_js.delay(function () {
          _this.hide();
        }, this.setting.stayTime + this.setting.showDuration);
      }
    }
  }, {
    key: '_clearStay',
    value: function _clearStay() {
      clearTimeout(this._stayTimer);
      this._stayTimer = null;
    }
  }, {
    key: '_documentBind',
    value: function _documentBind(unbind) {
      var _this2 = this;

      var self = this;
      if (this.setting.clickDocumentHide === false) {
        return;
      }
      if (unbind && this._unbindDocument) {
        this._unbindDocument();
        this._unbindDocument = null;
      } else if (!this._unbindDocument) {
        this._unbindDocument = helper_js.documentClick(this.element, function () {
          if (_this2.setting.clickDocumentHide === true) {
            _this2.hide();
          } else if (typeof self.setting.clickDocumentHide === 'function') {
            _this2.setting.clickDocumentHide.call(self);
          }
        });
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var id = this.primaryId;
      this.element.remove();
      Flyout.cache[id] = null;
      delete Flyout.cache[id];
    }
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

      if (this._currentAlignment === 'right') {
        this._startPosition.left += offset;
      } else if (this._currentAlignment === 'left') {
        this._startPosition.left -= offset + 9;
      }

      arrow.addClass(pos + ' ' + pos + '-' + this._currentAlignment);
    }
  }, {
    key: '_baseFlyoutShow',
    value: function _baseFlyoutShow(anchor, placement, alignment, fixed) {
      var _this3 = this;

      var self = this;
      var element = this.element;
      var sameAnchor = false;

      if (!anchor) {
        anchor = this._anchor;
      } else if (!anchor.jquery) {
        anchor = $(anchor);
      }

      if (!placement) {
        placement = this._placement;
      }

      if (!alignment) {
        alignment = this._alignment;
      }

      if (!anchor) {
        return;
      } else {
        if (this._currentAnchor && this._currentAnchor[0] === anchor[0]) {
          sameAnchor = true;
        }
        this._currentAnchor = anchor;
        this._currentPlacement = placement;
        this._currentAlignment = alignment;
      }

      Flyout.currentShowFlyout = this;

      if (anchor) {
        this._getTopLeft(fixed);
      }

      if (!this.alone) {
        this._hideAllVisibleFlyout();
      }

      if (sameAnchor && this.setting.sameAnchorHide && !this._isHide) {
        this.hide();
      } else if (!sameAnchor || sameAnchor && !this.setting.sameAnchorHide || sameAnchor && this.setting.sameAnchorHide && this._isHide) {
        this._documentBind(true);

        this._createStayTimer();
        this.setting.arrow && self._arrowPostion();

        element.show().css(this._startPosition).stop().animate(this._endPosition, {
          easing: this.setting.easing,
          duration: this.setting.showDuration,
          complete: function complete() {
            _this3._isHide = false;
            _this3._documentBind();
            _this3.emit('shown');
          }
        });

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
  }, {
    key: '_hideAllVisibleFlyout',
    value: function _hideAllVisibleFlyout() {
      var currentId = this.primaryId;
      $.each(Flyout.cache, function (id, flyout) {
        if (flyout && currentId !== id && !flyout._isHide && !flyout.alone) {
          flyout.hide();
        }
      });
    }
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
      };
      var element = {
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
            this._fitRight(anchor, element);
            this._where.at = 'right';
          }
          this._alignVertically(anchor, element);
          break;
        case 'right':
          this._where.at = 'right';
          if (!this._fitRight(anchor, element) && !fixed) {
            this._fitLeft(anchor, element);
            this._where.at = 'left';
          }
          this._alignVertically(anchor, element);
          break;
        case 'auto':
          break;
      }
    }
  }, {
    key: '_fitTop',
    value: function _fitTop(anchorDimension, flyoutDimension) {
      this._nextTop = anchorDimension.top - flyoutDimension.height;
      this._nextAnimTop = this._nextTop - this.setting.showOffset;
      return this._nextTop >= 0 && this._nextAnimTop > this._currentScrollTop && this._nextAnimTop + flyoutDimension.height < anchorDimension.top;
    }
  }, {
    key: '_fitBottom',
    value: function _fitBottom(anchorDimension, flyoutDimension) {
      this._nextTop = anchorDimension.bottom;
      this._nextAnimTop = anchorDimension.bottom + this.setting.showOffset;
      return this._nextTop >= 0 && this._nextAnimTop - this._currentScrollTop + flyoutDimension.height < $window.height();
    }
  }, {
    key: '_fitLeft',
    value: function _fitLeft(anchorDimension, flyoutDimension) {
      this._nextLeft = anchorDimension.left - flyoutDimension.width + this.setting.showOffset;
      this._nextAnimLeft = this._nextLeft - this.setting.showOffset * 2;
      return this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width();
    }
  }, {
    key: '_fitRight',
    value: function _fitRight(anchorDimension, flyoutDimension) {
      this._nextLeft = anchorDimension.right - this.setting.showOffset;
      this._nextAnimLeft = this._nextLeft + this.setting.showOffset * 2;
      return this._nextLeft >= 0 && this._nextLeft + flyoutDimension.width < $window.width();
    }
  }, {
    key: '_fitAlignLeft',
    value: function _fitAlignLeft(anchorDimension, flyoutDimension) {
      this._nextLeft = anchorDimension.left;
      return anchorDimension.left + flyoutDimension.width < $window.width();
    }
  }, {
    key: '_fitAlignRight',
    value: function _fitAlignRight(anchorDimension, flyoutDimension) {
      this._nextLeft = anchorDimension.right - flyoutDimension.width;
      return anchorDimension.right > flyoutDimension.width;
    }
  }, {
    key: '_alignVertically',
    value: function _alignVertically(anchorDimension, flyoutDimension) {
      if (this._currentAlignment === 'center') {
        this._nextTop = anchorDimension.top + anchorDimension.height / 2 - flyoutDimension.height / 2;
      } else if (this._currentAlignment === 'top') {
        this._nextTop = anchorDimension.top;
      } else if (this._currentAlignment === 'bottom') {
        this._nextTop = anchorDimension.bottom - flyoutDimension.height;
      }

      this._startPosition.top = this._nextTop;
      this._startPosition.left = this._nextLeft;
      this._endPosition.left = this._nextAnimLeft;
    }
  }, {
    key: '_alignHorizontally',
    value: function _alignHorizontally(anchorDimension, flyoutDimension) {
      var width = $window.width();

      if (this._currentAlignment === 'center') {
        this._nextLeft = anchorDimension.left + anchorDimension.width / 2 - flyoutDimension.width / 2;

        if (this._nextLeft + flyoutDimension.width > width) {
          this._currentAlignment = 'right';
        } else if (this._nextLeft < 0) {
          this._currentAlignment = 'left';
        }
      }

      if (this._currentAlignment === 'left' && !this._fitAlignLeft(anchorDimension, flyoutDimension)) {
        this._fitAlignRight(anchorDimension, flyoutDimension);
        this._currentAlignment = 'right';
      } else if (this._currentAlignment === 'right' && !this._fitAlignRight(anchorDimension, flyoutDimension)) {
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
        var $this = $(this);
        var flyoutControl = $this.data('flyout');
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

Flyout$1.primaryId = 0;
Flyout$1.cache = {};

Flyout$1.currentShowFlyout = null;

var VueFlyout = {
  name: 'FlyoutComponent',
  template: '<div class="flyout"><slot></slot></div>',
  props: {
    options: Object,
    outside: {
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      isShow: false
    };
  },
  created: function created() {
    this.flyout = null;
  },
  mounted: function mounted() {
    if (this.outside) {
      document.body.appendChild(this.$el);
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (this.$el) {
      document.body.removeChild(this.$el);
      this.flyout && this.flyout.destroy();
    }
  },

  methods: {
    show: function show(target) {
      var placement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'bottom';

      var _this = this;

      var alignment = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'left';
      var fixed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!this.flyout) {
        this.flyout = new Flyout$1(this.$el, this.options);
        this.flyout.on('show', function () {
          _this.$emit('show');
        });
        this.flyout.on('hide', function () {
          _this.$emit('hide');
        });
        this.flyout.on('shown', function () {
          _this.$emit('shown');
        });
        this.flyout.on('hidden', function () {
          _this.$emit('hidden');
        });
        this.flyout.on('created', function () {
          _this.$emit('created');
        });
      }
      this.flyout.show(target, placement, alignment, fixed);
      return this;
    },
    hide: function hide() {
      this.flyout && this.flyout.hide();
      return this;
    },
    position: function position() {
      this.flyout && this.flyout.position();
      return this;
    }
  }
};

function install(Vue) {
  if (install.installed) return;
  install.installed = true;

  Vue.component('flyout', VueFlyout);
}

var confirm = function (anchor) {
  var ok = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : helper_js.noop;
  var html = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var tpl = '<div class="flyout-box flyout-confirm"><p class="text"></p><div class="buttons"><button role="cancel" class="btn btn-sm btn-secondary">\u53D6\u6D88</button><button role="ok" class="btn btn-sm btn-primary">\u786E\u8BA4</button></div></div>';

  var flyout = new Flyout$1(tpl, {
    destroy: true
  });

  flyout.element.on('click', 'button[role]', function (e) {
    var type = $(e.target).attr('role');
    if (type === 'ok') {
      ok();
    }
    flyout.hide();
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

var tips = function (anchor, html, options) {
  anchor = $(anchor);

  var flyout = anchor.data('flyout');

  if (!flyout) {
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

    if (typeof options === 'string' && options.length) {
      setting.classStyle = 'alert-' + options;
    } else if ($.isPlainObject(options) || typeof options === 'undefined') {
      Object.assign(setting, options);
      if (setting.classStyle.length) {
        setting.classStyle = 'alert-' + setting.classStyle;
      }
    }

    flyout = new Flyout$1('<div class="flyout-tips alert"></div>', setting);
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

Flyout$1.install = install;
Flyout$1.version = '__VERSION__';

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Flyout$1);
}

exports.confirm = confirm;
exports.tips = tips;
exports['default'] = Flyout$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
