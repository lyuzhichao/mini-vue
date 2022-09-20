import {reactive} from "./reactive";
import {isTracking, track, trackEffects, triggerEffects} from "./effect";
// @ts-ignore
import {hasChanged, isObject} from "../shared";

class RefImpl {
    private _value:any
    private _rawValue:any
    public dep
    public _v_isRef=true
    constructor(value) {
        //take care of edge case for Object value
        //1. value is Object or not
        this._rawValue=value
        this._value=convert(value)
        this.dep=new Set()
    }
    get value(){
        trackRefValue(this)
        return this._value
    }
    set value(newValue){
        //take care of edge case for Object value
        if (hasChanged(newValue,this._rawValue)){
            this._rawValue=newValue
            this._value=convert(newValue)
            triggerEffects(this.dep)
        }
    }
}

function convert(value){
    return isObject(value)?reactive(value):value
}

function trackRefValue(ref){
    if (isTracking()){
        trackEffects(ref.dep)
    }
}

export function ref(value){
    return new RefImpl(value)
}
export function isRef(ref){
    return !!ref._v_isRef
}
export function unRef(ref){
    if (isRef(ref)){
        return ref._value
    }
    return ref
}

export function proxyRefs(objectWithRefs){
    return new Proxy(objectWithRefs,{
        get(target,key){
           return unRef(Reflect.get(target,key))
        },
        set(target,key,value){
            if (isRef(target[key]) && !isRef(value)){
                target[key].value=value
                return true
            } else {
                return Reflect.set(target,key,value)
            }
        }
    })
}