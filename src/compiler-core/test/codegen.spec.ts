import {baseParse} from "../src/parse";
import {generate} from "../src/codegen";
import {transform} from "../src/transform";
import {transformExpresssion} from "../src/transforms/transformExpresssion";
import {transformElement} from "../src/transforms/transfromElement";
import {transformText} from "../src/transforms/transformText";

describe('codegen',()=>{
    it('string',()=>{
        const ast=baseParse('hi')
        transform(ast)
        const {code}=generate(ast)
        //snapShot
        expect(code).toMatchSnapshot()
    });
    it('interpolation',()=>{
        const ast=baseParse('{{message}}')
        transform(ast,{
            nodeTransforms:[transformExpresssion]
        })
        const {code}=generate(ast)
        //snapShot
        expect(code).toMatchSnapshot()
    });
    it('element',()=>{
        const ast=baseParse("<div>hi, {{message}}</div>")
        transform(ast,{
            nodeTransforms:[transformExpresssion,transformElement,transformText]
        })
        const {code}=generate(ast)
        //snapShot
        expect(code).toMatchSnapshot()
    })
})