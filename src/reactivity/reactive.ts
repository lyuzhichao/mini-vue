import {track} from "./effect";
import {trigger} from "./effect";

export function reactive(raw){
    return new Proxy(raw,{
        get(target,key){
            const res=Reflect.get(target,key)
            //collect deps
            track(target,key)
            return res
        },
        set(target,key,value){
            const res=Reflect.set(target,key,value)
            //trigger deps
            trigger(target,key)
            return res
        }
    })
}