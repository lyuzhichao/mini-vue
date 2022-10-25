export const enum NodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ELEMENT,
    TEXT,
    ROOT,
    COMPOND_EXPRESSION
}

export function createVNodeCall(context,vnodeTag,vnodeProps,vnodeChildren){
    return {
        type:NodeTypes.ELEMENT,
        tag:vnodeTag,
        props:vnodeProps,
        children:vnodeChildren
    }
}