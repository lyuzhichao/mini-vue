import {NodeTypes} from "./ast";

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {

    const context = createParseContext(content)

    return createRoot(parseChildren(context,[]))
}

function parseChildren(context,ancestors) {

    const nodes: any = []
    while (!isEnd(context,ancestors)) {
        let node
        const s = context.source
        console.log('s: ',s)
        if (s.startsWith("{{")) {
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context,ancestors)
                console.log('is element')
            }
        }

        if (!node) {
            node = parseText(context)
        }
        console.log('node: ',node)
        nodes.push(node)
    }
    return nodes
}

function isEnd(context,ancestor) {
    //source meet element end tag
    const s = context.source
    console.log('isEnd: ',s)
    if (s.startsWith('</')){
        for (let i=ancestor.length-1;i>=0;i--){
            const tag=ancestor[i].tag
            if (startsWithEndTagOpen(s,tag)){
                return true
            }
        }
    }
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    //source has value
    return !s
}

function parseTextData(context, length) {
    const content = context.source.slice(0, length)
    advanceBy(context, length)
    return content
}

function parseText(context) {

    // const content=context.source.slice(0,context.source.length)
    // advanceBy(context,content.length)
    let endIndex = context.source.length
    let endTokens = ['<',"{{"]
    for (let i=0;i<=endTokens.length-1;i++){
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1 && endIndex>index) {
            endIndex = index
        }
    }


    const content = parseTextData(context, endIndex)
    console.log('text: ', content)
    console.log('after text',context.source)
    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTag(context, type) {
    console.log('before match: ',context.source)
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    console.log('match: ', match)
    const tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, 1)
    if (type === TagType.End) return
    console.log('advance element source', context.source)
    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}

function parseElement(context,ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context,ancestors)
    ancestors.pop()
    //remove end tag
    if (startsWithEndTagOpen(context.source,element.tag)){
        parseTag(context, TagType.End)
    } else {
        throw new Error(`Lack end tag: ${element.tag}`)
    }

    console.log('-----------------', context.source)
    return element
}

function startsWithEndTagOpen(source,tag){
    return source.startsWith('</')  && source.slice(2,2+tag.length).toLowerCase()===tag.toLowerCase()
}

function parseInterpolation(context) {
    const openDelimiter = "{{"
    const closeDelimiter = "}}"
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advanceBy(context, openDelimiter.length)

    console.log('context source', context.source)

    const rawContentLength = closeIndex - openDelimiter.length
    const rawContent = parseTextData(context, rawContentLength)
    console.log('rawContent: ', rawContent)
    const content = rawContent.trim()
    console.log('content: ', content)
    advanceBy(context, closeDelimiter.length)
    console.log('remove source: ', context.source)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context, length) {
    context.source = context.source.slice(length)
}


function createParseContext(content: string) {
    return {
        source: content
    }
}

function createRoot(children) {
    return {
        children,
        type: NodeTypes.ROOT
    }
}