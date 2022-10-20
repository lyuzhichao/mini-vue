import {h} from '../../lib/guide-mini-vue.esm.js'
import {Foo} from './Foo.js'

export const App = {
    //render is required
    name: 'App',
    render() {
        return h(
            'div',
            {
                id: 'root',
                class: ['red', 'hard'],
                onClick: () => {
                    console.log('click')
                }
            },
            //setupState
            // "HI, " + this.msg
            ////this.$el -> get root element

            // 'hi,mini-vue'
            [
                h('p', {class: 'red'}, 'hi'),
                h('p', {class: 'blue'}, 'mini-vue'),
                h(Foo, {
                    count: 1,
                    onAdd(a,b) {
                        console.log('on add')
                        console.log(`a:${a},b:${b}`)
                    },
                    onAddFoo(a,b){
                        console.log(`onAddFoo:a:${a},b:${b}`)
                    }
                })]
        )
    },
    setup() {
        //composition api
        return {
            msg: 'mini-vue'
        }
    }
}