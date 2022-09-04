import {track, trigger} from "./effect";

const get=createGetter()
const set=createSetter()

const readOnlyGet=createGetter(true)
const readOnlySet=createSetter(true)

function createGetter(isReadOnly = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key)
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