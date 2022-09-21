import {mutableHandlers,readOnlyHandlers,shallowReadonlyHandlers} from "./baseHandlers";
// @ts-ignore
import {isObject} from "../shared";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadOnly'
}

export function reactive(raw) {
    return createActiveObject(raw,mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw,readOnlyHandlers)
}

export function shallowReadOnly(raw){
    return createActiveObject(raw,shallowReadonlyHandlers)
}

export function isReactive(value){
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadOnly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
    return isReactive(value) || isReadOnly(value)
}

function createActiveObject(raw,baseHandlers){
    if (!isObject(raw)){
        console.warn('target must be an Object')
        return raw
    }
    return new Proxy(raw, baseHandlers)
}