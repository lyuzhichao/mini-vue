import {createVNode} from "./vnode";
import {render} from "./renderer";
export function createApp(rootComponent,parentComponent){
    return {
        mount(rootContainer){
            // vnode
            //all following operation base on vnode
            const vnode=createVNode(rootComponent)
            render(vnode,rootContainer,parentComponent)
        }
    }
}
