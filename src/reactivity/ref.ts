import {reactive} from "./reactive";
import {isTracking, track, trackEffects, triggerEffects} from "./effect";
import {hasChanged, isObject} from "../shared";

class RefImpl {
    private _value:any
    private _rawValue:any
    public dep
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
        } else {
            return
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