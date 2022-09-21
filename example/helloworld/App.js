import {h} from '../../lib/guide-mini-vue.esm.js'

export const App = {
    //render is required
    render() {
        return h(
            'div',
            {
                id: 'root',
                class: ['red', 'hard'],
                onClick:()=>{
                    console.log('click')
                }
            },
            //setupState
            "HI, " + this.msg
            ////this.$el -> get root element

            // 'hi,mini-vue'
            // [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'mini-vue')]
        )
    },
    setup() {
        //composition api
        return {
            msg: 'mini-vue'
        }
    }
}