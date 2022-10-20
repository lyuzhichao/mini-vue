export const enum ShapeFlags {
    ELEMENT=1,//0001
    STATEFUL_COMPONENT=1<<1,//0010
    TEXT_CHILDREN=1<<2,//0100
    ARRAY_CHILDREN=1<<3,//1000
    SLOT_CHILDREN=1<<4
}



// const shapeFlag={
//     element:0,
//     statefulComponent:0,
//     textChildren:0,
//     arrayChildren:0
// }
// //vnode -> status
// not enough efficiency
// set
// shapeFlag.arrayChildren=1
//get
// if(shapeFlag.element){
//     console.log(shapeFlag.element)
// }

//byte calculation | &
//0001 -> element
//0010 -> stateful
//0100 -> textChildren
//1000 -> arrayChildren