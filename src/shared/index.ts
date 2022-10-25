export const extend=Object.assign

export const EMPTY_OBJ={}
export * from './toDisplayString'

export {ShapeFlags} from './shapeFlags'

export function isString(value){
    return typeof value==='string'
}

export function isObject(val){
    return val!==null && typeof val==='object'
}
export const hasChanged=(value,newValue)=>{
    return !Object.is(value,newValue)
}
export const hasOwn=(val,key)=>Object.prototype.hasOwnProperty.call(val,key)

export const camelize=(str:string)=>{
    return str.replace(/-(\w)/g,(_,c:string)=>{
        return c?c.toUpperCase():""
    })
}

export const capitalize=(str:string)=>{
    return str.charAt(0).toUpperCase()+str.slice(1)
}

export const toHanlderkey=(str:string)=>{
    return str?'on'+capitalize(str):''
}