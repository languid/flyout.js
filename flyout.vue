<template>
    <div class="flyout">
        <slot name="body"></slot>
    </div>
</template>

<script>

    import Flyout from './src/Flyout';

    export default {
        name: 'FlyoutComponent',
        props: {
            options: Object,
            outside: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                isShow: false
            }
        },
        created(){
            this.flyout = null;
        },
        mounted(){
            if(this.outside){
                document.body.appendChild(this.$el);
            }
        },
        destroyed(){
            document.body.removeChild(this.$el);
            this.flyout && this.flyout.destroy();
        },
        methods: {
            show(target, placement='bottom', alignment = 'left'){
                const self = this;
                if(!this.flyout){
                    this.flyout = new Flyout(this.$el, Object.assign({}, this.options, {
                        events: {
                            show(){
                                self.$emit('show');
                            },
                            hide(){
                                self.$emit('hide');
                            },
                            shown(){
                                self.$emit('shown')
                            },
                            hidden(){
                                self.$emit('hidden');
                            },
                            created(){
                                self.$emit('created');
                            },
                            mounted(){
                                self.$emit('mounted');
                            }
                        }
                    }));
                }
                this.flyout.show(target, placement, alignment);
                return this;
            },
            hide(){
                this.flyout.hide();
                return this;
            },
            position(){
                this.flyout.position();
                return this;
            }
        }
    }
</script>