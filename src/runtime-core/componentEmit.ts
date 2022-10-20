import {toHanlderkey,camelize} from "../shared";

export function emit(instance,event,...args){
    console.log('emit event',event)
    const {props}=instance
    //TPP
    //First special function then general function


    const handlerName=toHanlderkey(camelize(event))

    const handler=props[handlerName]
    handler && handler(...args)
}