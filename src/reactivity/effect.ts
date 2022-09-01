let activeEffect;
class ReactiveEffect{
    private _fn:any
    constructor(fn) {
        this._fn=fn
    }
    run(){
        activeEffect=this
        this._fn()
    }
}
const targetMap=new WeakMap()
export function track(target,key){
    //use target as key to get depsMap, and use key to get dep
    let depsMap=targetMap.get(target)
    if (!depsMap){
        depsMap=new Map()
        targetMap.set(target,depsMap)
    }
    let dep=depsMap.get(key)
    if (!dep){
        dep=new Set()
        depsMap.set(key,dep)
    }
    dep.add(activeEffect)
}
export function trigger(target,key){
    let depsMap=targetMap.get(target)
    if (depsMap){
        let dep=depsMap.get(key)
        if (dep){
            dep.forEach(effect=>{
                effect.run()
            })
        }
    }
}

export function effect(fn){
    const _effect=new ReactiveEffect(fn)
    _effect.run()
}