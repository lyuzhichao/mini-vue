import {NodeTypes} from "./ast";
import {TO_DISPLAY_STRING} from "./runtimeHelper";

export function transform(root,options={}){
    console.log('original root: ',root)
    const context=createTransformContext(root,options)
    //深度优先搜索
    tranverseNode(root,context)
    createRootCodegen(root)
    root.helpers=[...context.helpers.keys()]
    console.log('root: ',root)
}

function createRootCodegen(root){
    if (root.children){
        root.codegenNode=root.children[0]
    }
}

function tranverseNode(node,context){

    const nodeTransforms=context.nodeTransforms
    for (let i=0;i<nodeTransforms.length;i++){
        const transform=nodeTransforms[i]
        transform(node)
    }

    switch (node.type){
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            tranverseChildren(node,context)
            break
        default:
            break
    }

    // tranverseChildren(node,context)

}

function tranverseChildren(parent,context){
    const children=parent.children
    if(children){
        for (let i=0;i<children.length;i++){
            const node=children[i]
            tranverseNode(node,context)
        }
    }
}

function createTransformContext(root,options){
    const context={
        root,
        nodeTransforms:options.nodeTransforms || [],
        helpers:new Map(),
        helper(key){
            context.helpers.set(key,1)
        }
    }
    return context
}