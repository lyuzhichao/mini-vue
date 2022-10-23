import {NodeTypes} from "../ast";

export function transformExpresssion(node){
    if (node.type===NodeTypes.INTERPOLATION){
        node.content=processExpression(node.content)
    }
}

function processExpression(node){
    node.content=`ctx_.${node.content}`
    return node
}
