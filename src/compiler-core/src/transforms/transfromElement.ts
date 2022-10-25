import {createVNodeCall, NodeTypes} from "../ast";
import {CREATE_ELEMENT_VNODE} from "../runtimeHelper";

export function transformElement(node,context){
    if (node.type===NodeTypes.ELEMENT){
        return ()=>{
            context.helper(CREATE_ELEMENT_VNODE)

            const vnodeTag=`"${node.tag}"`

            let vNodeProps

            const children = node.children
            let vnodeChildren=children[0]

            // const vnodeElement = {
            //     type:NodeTypes.ELEMENT,
            //     tag:vnodeTag,
            //     props:vNodeProps,
            //     children:vnodeChildren
            // }

            node.codegenNode=createVNodeCall(
                context,
                vnodeTag,
                vNodeProps,
                vnodeChildren
            )
        }
    }
}