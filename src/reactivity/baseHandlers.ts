import {track, trigger} from "./effect";
import {reactive, ReactiveFlags, readonly} from "./reactive";
import {isObject} from "../shared";

const get=createGetter()
const set=createSetter()

const readOnlyGet=createGetter(true)
const readOnlySet=createSetter(true)

const shallowReadOnlyGet=createGetter(true,true)
const shallowReadOnlySet=createSetter(true)


function createGetter(isReadOnly = false,shallow=false) {
    return function get(target, key) {

        //This part is used to check whether data is read only or is reactive
        if (key===ReactiveFlags.IS_REACTIVE){
            return !isReadOnly
        } else if (key===ReactiveFlags.IS_READONLY){
            return isReadOnly
        }
        const res = Reflect.get(target, key)

        if (shallow){
            return res
        }

        if (isObject(res)){
            return isReadOnly?readonly(res):reactive(res)
        }
        //collect deps
        if (!isReadOnly) {
            track(target, key)
        }
        return res
    }
}

function createSetter(isReadOnly = false) {
    return function set(target, key, value) {
        if (isReadOnly) {
            console.warn(`${key} set failed, because target is readonly`,target)
            return true
        }
        const res = Reflect.set(target, key, value)
        //trigger deps
        trigger(target, key)
        return res
    }
}

export const mutableHandlers={
    get,
    set
}
export const readOnlyHandlers={
    get:readOnlyGet,
    set:readOnlySet
}
export const shallowReadonlyHandlers = {
    get:shallowReadOnlyGet,
    set:shallowReadOnlySet
}