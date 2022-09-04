import {extend} from "../shared";

let activeEffect;
class ReactiveEffect{
    private _fn:any
    deps=[]
    active=true //This is the flag whether stop function has been already called
    onStop?:()=>void
    constructor(fn,public scheduler?:Function | undefined) {
        this._fn=fn
    }
    run(){
        activeEffect=this
        return this._fn()
    }
    stop(){
        if (this.active){
            cleanupEffect(this)
            if (this.onStop){
                this.onStop()
            }
            this.active=false
        }
    }
}

function cleanupEffect(effect){
    effect.deps.forEach((dep:any)=>{
        dep.delete(effect)
    })
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
    if (!activeEffect) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}
export function trigger(target,key){
    let depsMap=targetMap.get(target)
    if (depsMap){
        let dep=depsMap.get(key)
        if (dep){
            dep.forEach(effect=>{
                if (effect.scheduler){
                    effect.scheduler()
                } else {
                    effect.run()
                }

            })
        }
    }
}

export function stop(runner){
    runner.effect.stop()
}

export function effect(fn,options:any={}){
    const _effect=new ReactiveEffect(fn,options.scheduler)
    // _effect.onStop=options.onStop
    // Object.assign(_effect,options)
    //extend
    extend(_effect,options) //This is same as line 72
    _effect.run()
    const runner=_effect.run.bind(_effect)
    runner.effect=_effect
    return runner
}