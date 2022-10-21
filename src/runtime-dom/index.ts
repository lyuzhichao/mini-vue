import {createRenderer} from "../runtime-core";

function createElement(type){
    return document.createElement(type)
}

function patchProp(el,key,val){
    const isOn = (key) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), val)
    } else {
        el.setAttribute(key, val)
    }
}

function insert(el,container){
    container.append(el)
}

const renderer:any = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...args){
    return renderer.createApp(...args)
}
export * from '../runtime-core'