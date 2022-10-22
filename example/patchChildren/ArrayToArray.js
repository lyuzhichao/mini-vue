import {ref, h} from '../../lib/guide-mini-vue.esm.js'

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C')]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'E'}, 'E')]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C')]
// const nextChildren = [
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),
// ]
// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'D'}, 'D'),
// ]
// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),]
// const nextChildren = [
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
// ]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),]
// const nextChildren = [
//
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C',id:'c-prev'}, 'C'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'C',id:'c-next'}, 'C'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),
// ]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),
// ]

// const preChildren= [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),]
// const nextChildren = [
//     h('p', {key: 'A'}, 'A'),
//     h('p', {key: 'B'}, 'B'),
//     h('p', {key: 'E'}, 'E'),
//     h('p', {key: 'C'}, 'C'),
//     h('p', {key: 'D'}, 'D'),
//     h('p', {key: 'F'}, 'F'),
//     h('p', {key: 'G'}, 'G'),
// ]
const preChildren= [
    h('p', {key: 'A'}, 'A'),
    h('p', {key: 'B'}, 'B'),
    h('p', {key: 'C'}, 'C'),
    h('p', {key: 'D'}, 'D'),
    h('p', {key: 'E'}, 'E'),
    h('p', {key: 'Z'}, 'Z'),
    h('p', {key: 'F'}, 'F'),
    h('p', {key: 'G'}, 'G'),]
const nextChildren = [
    h('p', {key: 'A'}, 'A'),
    h('p', {key: 'B'}, 'B'),
    h('p', {key: 'D'}, 'D'),
    h('p', {key: 'C'}, 'C'),
    h('p', {key: 'Y'}, 'Y'),
    h('p', {key: 'E'}, 'E'),
    h('p', {key: 'F'}, 'F'),
    h('p', {key: 'G'}, 'G'),
]

export const ArrayToArray = {
    name: 'ArrayToArray',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this
        return self.isChange === true
            ? h('div', {}, nextChildren)
            : h('div', {}, preChildren)
    }
}