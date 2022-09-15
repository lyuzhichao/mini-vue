import h from '../../lib/guide-mini-vue.esm'
export const App={
    //render is required
   render(){
       return h('div',
           {
           id:'root',
           class:['red','hard']
       },
           // 'hi,mini-vue'
           [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'mini-vue')]
       )
   },
    setup(){
       //composition api
        return {
            msg:'mini-vue'
        }
    }
}