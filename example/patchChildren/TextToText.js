import {ref, h} from '../../lib/guide-mini-vue.esm.js'

const nextChildren = 'newChildren'
const preChildren = 'oldChildren'

export const TextToText = {
    name: 'ArrayToText',
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