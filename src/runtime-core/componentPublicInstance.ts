import {hasOwn} from "../shared";

const publicPropertiesMap = {
    $el:(i)=>i.vnode.el,
    //$slots
    $slots:(i)=>i.slots,
    //$emit
    $emit: (i) => i.emit,
}

export const publicInstanceProxyHandlers={
    get({_:instance},key){
        //setupState
        const {setupState,props}=instance
        if (key in setupState){
            return setupState[key]
        }

        if (hasOwn(setupState,key)){
            return setupState[key]
        } else if (hasOwn(props,key)){
            return props[key]
        }
        // if (key==='$el'){
        //     return instance.vnode.el
        // }
        const publicGetter =publicPropertiesMap[key]
        if (publicGetter){
            return publicGetter(instance)
        }
    }
}