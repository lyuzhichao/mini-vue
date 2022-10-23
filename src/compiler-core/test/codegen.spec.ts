import {baseParse} from "../src/parse";
import {generate} from "../src/codegen";
import {transform} from "../src/transform";
import {transformExpresssion} from "../src/transforms/transformExpresssion";

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
    })
})