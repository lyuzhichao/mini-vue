import {h,getCurrentInstance} from '../../lib/guide-mini-vue.esm.js'
import {Foo} from "./Foo.js";

export const App = {
    //render is required
    name: 'App',
    render() {
        return h('div',{},[h('p',{},'current instance demo'),h(Foo)])
    },
    setup() {
        const instance=getCurrentInstance()
        console.log('App',instance)
        return {}
    }
}