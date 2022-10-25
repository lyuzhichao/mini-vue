import {baseParse} from "./parse";
import {transform} from "./transform";
import {generate} from "./codegen";
import {transformExpresssion} from "./transforms/transformExpresssion";
import {transformElement} from "./transforms/transfromElement";
import {transformText} from "./transforms/transformText";

export function baseCompile(template){
    const ast=baseParse(template)
    transform(ast,{
        nodeTransforms:[transformExpresssion,transformElement,transformText]
    })
    return generate(ast)
}

