import {NodeTypes} from "./ast";
import {helperMapName,TO_DISPLAY_STRING} from "./runtimeHelper";

export function generate(ast) {
    console.log('ast',ast)
    const context=createCodegenContext()
    const {push}=context

    getFunctionPreamble(ast,context)

    const functionName = 'render'
    const args = ['_ctx', '_cache','$props','$setup','$data','$options']
    const signature = args.join(', ')

    // const node=ast.codegenNode
    push(`function ${functionName}(${signature}){`)
    genNode(ast.codegenNode,context)
    push('}')
    console.log(context.code)
    return {
        code:context.code
    }


    // return {
    //     code: `return function render(_ctx,_cache,$props,$setup,$data,$options){return "hi"}`
    // }
}
function getFunctionPreamble(ast,context){
    const {push}=context
    const vueBing='Vue'
    const aliasHelper=(s)=>`${helperMapName[s]}: _${helperMapName[s]}`
    if (ast.helpers.length>0){
        push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${vueBing}`)
    }
    push('\n')
    push('return ')
}

function genNode(node,context){

    switch (node.type){
        case NodeTypes.TEXT:
            genText(node,context)
            break
        case NodeTypes.INTERPOLATION:
            genInterpolation(node,context)
            break
        case NodeTypes.SIMPLE_EXPRESSION:
            getExpression(node,context)
            break
    }
}

function genText(node,context){
    const {push}=context
    push(`return "${node.content}"`)
}

function genInterpolation(node,context){
    const {push,helper} = context
    push(`${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content,context)
    push(')')
}

function getExpression(node,context){
    const {push} = context
    push(`${node.content}`)
}

function createCodegenContext(){
    const context={
        code:'',
        push(source){
            context.code+=source
        },
        helper(key){
            return `_${helperMapName[key]}`
        }
    }
    return context
}