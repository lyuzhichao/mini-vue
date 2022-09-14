import h from '../../lib/guide-mini-vue.esm'
export const App={
    //render is required
   render(){
       return h('div','hi,'+this.msg)
   },
    setup(){
       //composition api
        return {
            msg:'mini-vue'
        }
    }
}