// @ts-ignore
import {extend} from "../shared";

let activeEffect;
let shouldTrack;
export class ReactiveEffect{
    private _fn:any
    deps=[]
    active=true //This is the flag whether stop function has been already called
    onStop?:()=>void

    constructor(fn,public scheduler?:Function | undefined) {
        this._fn=fn
    }
    run(){
        if (!this.active){
            return this._fn()
        }
        //should track or collect side effect
        shouldTrack=true
        activeEffect=this
        const result=this._fn()
        //reset shouldTrack status
        shouldTrack=false
        return result
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
    effect.deps.length=0
}

export function isTracking(){
    return shouldTrack && activeEffect!==undefined
}


const targetMap=new WeakMap()
export function track(target,key){
    // if (!activeEffect) return
    // if (!shouldTrack) return
    if (!isTracking()) return
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
    trackEffects(dep)
}

export function trackEffects(dep){
    if (dep.has(activeEffect)) return;

    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function trigger(target,key){
    let depsMap=targetMap.get(target)
    if (depsMap){
        let dep=depsMap.get(key)
        triggerEffects(dep)
    }
}

export function triggerEffects(dep){
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
    runner['effect']=_effect
    return runner
}