import {publicInstanceProxyHandlers} from "./componentPublicInstance";
import {emit} from "./componentEmit";
import {initProps} from "./componentProps";
import {shallowReadOnly} from "../reactivity/reactive";
import {initSlots} from "./componentSlots";

export function createComponentInstance(vnode){
    const component={
        vnode,
        type:vnode.type,
        setupState:{},
        props:{},
        slots:{},
        emit:()=>{}
    }

    component.emit=emit.bind(null,component) as any
    return component
}

export function setUpComponent(instance){
    // initProps()
    initProps(instance,instance.vnode.props)
    // initSlots()
    initSlots(instance,instance.vnode.children)
    setupStatefulComponent(instance)
}

let currentInstance=null
export function setupStatefulComponent(instance){
    const Component=instance.type
    instance.proxy=new Proxy({_:instance},publicInstanceProxyHandlers)
    const {setup}=Component

    if (setup) {
        setCurrentInstance(instance)
        const setUpResult=setup(shallowReadOnly(instance.props),{emit:instance.emit})
        handleSetupResult(instance,setUpResult)
    }
    setCurrentInstance(null)
}

export function handleSetupResult(instance,setUpResult){
    if (typeof setUpResult==='object'){
        instance.setupState=setUpResult
    }
    finishComponentSetUp(instance)
}

export function finishComponentSetUp(instance){
    const Component=instance.type
    instance.render=Component.render
}

export function getCurrentInstance(){
    return currentInstance
}

export function setCurrentInstance(instance){
    currentInstance=instance
}