import {createComponentInstance,setUpComponent} from "./component";

export function render(vnode,container){
    //call patch function
    patch(vnode,container)
}

export function patch(vnode,container){
    //process component
    //if vnode is element, call processElement
    // processElement()
    processComponent(vnode,container)
}

export function processComponent(vnode,container){
    mountComponent(vnode,container)
}

export function mountComponent(vnode,container){
    const instance=createComponentInstance(vnode)
    setUpComponent(instance)
    setupRenderEffect(instance,container)
}

export function setupRenderEffect(instance,container){
    const subTree=instance.render()
    //subTree -> vnode -> patch - element -> mountElement
    patch(subTree,container)
}
