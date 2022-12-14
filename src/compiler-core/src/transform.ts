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
    const child=root.children[0]
    if (child.type===NodeTypes.ELEMENT){
        root.codegenNode=child.codegenNode
    } else {
        root.codegenNode=root.children[0]
    }
}

function tranverseNode(node,context){

    const nodeTransforms=context.nodeTransforms
    const exitFns:any=[]
    for (let i=0;i<nodeTransforms.length;i++){
        const transform=nodeTransforms[i]
        const onExit=transform(node,context)
        if (onExit) exitFns.push(onExit)
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
    let i=exitFns.length
    while (i--){
        exitFns[i]()
    }

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