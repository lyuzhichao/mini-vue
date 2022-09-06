import {isReadOnly, readonly} from "../reactive";
import {shallowReadOnly} from "../reactive";

describe('shallowReadOnly',()=>{
    test('should not make non-reactive properties reactive',()=>{
        const props=shallowReadOnly({n:{foo:1}})
        expect(isReadOnly(props)).toBe(true)
        expect(isReadOnly(props.n)).toBe(false)
    })
    it('warn when call set',()=>{
        console.warn=jest.fn()
        const user=shallowReadOnly({age:10})
        user.age=11
        expect(console.warn).toBeCalled()
    })
})