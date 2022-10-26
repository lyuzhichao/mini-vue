import {createVNodeCall, NodeTypes} from "../ast";
import {CREATE_ELEMENT_VNODE} from "../runtimeHelper";

export function transformElement(node,context){
    if (node.type===NodeTypes.ELEMENT){
        return ()=>{
            context.helper(CREATE_ELEMENT_VNODE)

            const vnodeTag=`"${node.tag}"`

            let vNodeProps=null

            let vnodeChildren = null
            if (node.children.length > 0) {
                if (node.children.length === 1) {
                    const child = node.children[0]
                    vnodeChildren = child
                }
            }

            node.codegenNode=createVNodeCall(
                context,
                vnodeTag,
                vNodeProps,
                vnodeChildren
            )
        }
    }
}