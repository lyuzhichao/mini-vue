import {createRenderer} from "../runtime-core";

function createElement(type){
    return document.createElement(type)
}

function patchProp(el,key,preVal,nextVal){
    const isOn = (key) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextVal)
    } else {
        if (nextVal===undefined || nextVal===null){
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }

    }
}

function insert(el,container,anchor){
    // container.append(el)
    container.insertBefore(el,anchor || null)
}
function remove(child){
    const parent=child.parentNode
    if (parent){
        parent.removeChild(child)
    }
}
function setTextElement(el,text){
    el.textContent=text
}

const renderer:any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setTextElement
})

export function createApp(...args){
    return renderer.createApp(...args)
}
export * from '../runtime-core'