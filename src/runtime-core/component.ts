import {publicInstanceProxyHandlers} from "./componentPublicInstance";
import {initProps} from "./componentProps";
import {shallowReadOnly} from "../reactivity/reactive";

export function createComponentInstance(vnode){
    const component={
        vnode,
        type:vnode.type,
        setupState:{}
    }
    return component
}

export function setUpComponent(instance){
    // initProps()
    initProps(instance,instance.vnode.props)
    // initSlots()


    setupStatefulComponent(instance)
}
export function setupStatefulComponent(instance){
    const Component=instance.type
    instance.proxy=new Proxy({_:instance},publicInstanceProxyHandlers)
    const {setup}=Component

    if (setup) {
        const setUpResult=setup(shallowReadOnly(instance.props))
        handleSetupResult(instance,setUpResult)
    }
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