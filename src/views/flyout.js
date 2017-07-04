import Flyout from '../flyout'

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
  beforeDestroy () {
    if (this.$el) {
      document.body.removeChild(this.$el)
      this.flyout && this.flyout.destroy()
    }
  },
  methods: {
    show (target, placement = 'bottom', alignment = 'left', fixed = false) {
      if (!this.flyout) {
        this.flyout = new Flyout(this.$el, this.options)
        this.flyout.on('show', () => {
          this.$emit('show')
        })
        this.flyout.on('hide', () => {
          this.$emit('hide')
        })
        this.flyout.on('shown', () => {
          this.$emit('shown')
        })
        this.flyout.on('hidden', () => {
          this.$emit('hidden')
        })
        this.flyout.on('created', () => {
          this.$emit('created')
        })
      }
      this.flyout.show(target, placement, alignment, fixed)
      return this
    },
    hide () {
      this.flyout && this.flyout.hide()
      return this
    },
    position () {
      this.flyout && this.flyout.position()
      return this
    }
  }
}
