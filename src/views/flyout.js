import Flyout from '../index'

export default {
  name: 'FlyoutComponent',
  template: '<div class="flyout"><slot></slot></div>',
  props: {
    options: Object,
    outside: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isShow: false
    }
  },
  created () {
    this.flyout = null
  },
  mounted () {
    if (this.outside) {
      document.body.appendChild(this.$el)
    }
  },
  destroyed () {
    document.body.removeChild(this.$el)
    this.flyout && this.flyout.destroy()
  },
  methods: {
    show (target, placement = 'bottom', alignment = 'left') {
      if (!this.flyout) {
        this.flyout = new Flyout(this.$el, Object.assign({}, this.options, {
          events: {
            show: () => {
              this.$emit('show')
            },
            hide: () => {
              this.$emit('hide')
            },
            shown: () => {
              this.$emit('shown')
            },
            hidden: () => {
              this.$emit('hidden')
            },
            created: () => {
              this.$emit('created')
            },
            mounted: () => {
              this.$emit('mounted')
            }
          }
        }))
      }
      this.flyout.show(target, placement, alignment)
      return this
    },
    hide () {
      this.flyout.hide()
      return this
    },
    position () {
      this.flyout.position()
      return this
    }
  }
}
