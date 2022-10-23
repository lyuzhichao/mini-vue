import {baseParse} from "../src/parse";
import {transform} from '../src/transform'
import {NodeTypes} from "../src/ast";

describe('transform',()=>{
    it('happy path',()=>{
        const ast:any=baseParse("<div>hi,{{message}}</div>")

        const plugin=(node)=>{
            if (node.type===NodeTypes.TEXT){
                node.content+='mini-vue'
            }
        }


        transform(ast,{
            nodeTransforms:[plugin]
        })
        const nodeNext=ast.children[0].children[0]
        expect(nodeNext.content).toBe('hi,mini-vue')
    })
})