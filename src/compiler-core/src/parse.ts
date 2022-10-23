import {NodeTypes} from "./ast";

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {

    const context = createParseContext(content)

    return createRoot(parseChildren(context))
}

function parseChildren(context) {

    const nodes:any=[]
    let node
    const s=context.source
    if (s.startsWith("{{")){
        node=parseInterpolation(context)
    } else if (s[0]==='<'){
        if (/[a-z]/i.test(s[1])){
            node=parseElement(context)
            console.log('is element')
        }
    }

    if (!node){
        node=parseText(context)
    }

    nodes.push(node)
    return nodes
}

function parseTextData(context,length){
    const content=context.source.slice(0,length)
    advanceBy(context,length)
    return content
}

function parseText(context){

    // const content=context.source.slice(0,context.source.length)
    // advanceBy(context,content.length)
    const content=parseTextData(context,context.source.length)
    console.log('text: ',context.source)
    return {
        type:NodeTypes.TEXT,
        tag:content
    }
}

function parseTag(context,tagType){
    const match:any=/^<\/?([a-z]*)/i.exec(context.source)
    console.log('match: ',match)
    const tag=match[1]
    advanceBy(context,match[0].length)
    advanceBy(context,1)
    if (tagType===TagType.End) return
    console.log('advabce element source',context.source)
    return {
        type:NodeTypes.ELEMENT,
        tag:tag
    }
}

function parseElement(context){
    const element =  parseTag(context,TagType.Start)
    parseTag(context,TagType.End)
    console.log('-----------------',context.source)
    return element
}

function parseInterpolation(context) {
    const openDelimiter="{{"
    const closeDelimiter="}}"
    const closeIndex=context.source.indexOf(closeDelimiter,openDelimiter.length)

    advanceBy(context,openDelimiter.length)

    console.log('context source',context.source)

    const rawContentLength=closeIndex-openDelimiter.length
    const rawContent=parseTextData(context,rawContentLength)
    console.log('rawContent: ',rawContent)
    const content=rawContent.trim()
    console.log('content: ',content)
    advanceBy(context,rawContentLength+closeDelimiter.length)
    console.log('remove source: ',context.source)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}
function advanceBy(context,length){
    context.source=context.source.slice(length)
}


function createParseContext(content: string) {
    return {
        source: content
    }
}

function createRoot(children) {
    return {
        children
    }
}