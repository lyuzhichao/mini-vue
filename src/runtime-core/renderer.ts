import {createComponentInstance,setUpComponent} from "./component";
// @ts-ignore
import {isObject} from "../shared";

export function render(vnode,container){
    //call patch function
    patch(vnode,container)
}

export function patch(vnode,container){
    //process component
    //if vnode is element, call processElement
    if (typeof vnode.type==="string"){
        processElement(vnode,container)
    } else if (isObject(vnode.type)){
        processComponent(vnode,container)
    }
}
export function processElement(vnode,container){
    mountElement(vnode,container)
}

export function mountElement(vnode,container){
    //vnode.children -> string / array
    const el=vnode.el=document.createElement(vnode.type)
    const {children}=vnode
    if (typeof children==="string"){
        el.textContent=children
    } else if (Array.isArray(children)){
        mountChildren(vnode,el)
    }
    const {props}=vnode
    for (const key in props){
        const val=props[key]
        el.setAttribute(key,val)
    }
    container.append(el)
}

export function mountChildren(vnode,container){
    vnode.children.forEach(child=>{
        patch(child,container)
    })
}

export function processComponent(vnode,container){
    mountComponent(vnode,container)
}

export function mountComponent(initialVnode,container){
    const instance=createComponentInstance(initialVnode)
    setUpComponent(instance)
    setupRenderEffect(instance,initialVnode,container)
}

export function setupRenderEffect(instance,initialVnode,container){
    const {proxy}=instance
    const subTree=instance.render().call(proxy)
    //subTree -> vnode -> patch - element -> mountElement
    patch(subTree,container)
    //all elements -> mount
    initialVnode.el=subTree.el
}
