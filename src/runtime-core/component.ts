export function createComponentInstance(vnode){
    const component={
        vnode,
        type:vnode.type
    }
    return component
}

export function setUpComponent(instance){
    // initProps()
    // initSlots()

    setupStatefulComponent(instance)
}
export function setupStatefulComponent(instance){
    const Component=instance.type

    const {setup}=Component

    if (setup) {
        const setUpResult=setup()
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