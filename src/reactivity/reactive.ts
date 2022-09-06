import {mutableHandlers,readOnlyHandlers,shallowReadonlyHandlers} from "./baseHandlers";

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

function createActiveObject(raw,baseHandlers){
    return new Proxy(raw, baseHandlers)
}