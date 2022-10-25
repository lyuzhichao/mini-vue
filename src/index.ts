//mini-vue output
// export * from './runtime-core'
export * from './runtime-dom'
export * from './reactivity'

import * as runtimedom from './runtime-dom'
import {baseCompile} from "./compiler-core/src";
import {registerRuntimeCompiler} from "./runtime-dom";

function compileToFunction(template) {
    const {code} = baseCompile(template)

    const render = new Function('Vue',code)(runtimedom)

    return render
    // function renderFunction(Vue) {
    //     const {toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, openBlock: _openBlock} = Vue
    //     return function render(_ctx, _cache, $props, $setup, $data, $options){
    //         _createElementVNode("div",null,"hi, "+_toDisplayString(ctx_.message))
    //     }
    //
    // }
}
registerRuntimeCompiler(compileToFunction)