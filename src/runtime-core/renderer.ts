import {createComponentInstance, setUpComponent} from "./component";
import {EMPTY_OBJ,ShapeFlags} from "../shared";
// import {ShapeFlags} from "../shared/shapeFlags";
import {Fragment, Text} from "./vnode";
import {createAppAPI} from "./createApp";
import {effect} from "../reactivity/effect";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove:hostRemove,
        setTextElement:hostSetTextElement
    } = options

    function render(vnode, container, parentComponent) {
        //call patch function
        patch(null,vnode, container, parentComponent,null)
    }

    function patch(n1,n2, container, parentComponent,anchor) {
        //process component
        //if vnode is element, call processElement
        //shapeFlag
        //vnode->flag
        //element
        //Fragment is only used for rendering children
        const {shapeFlag, type} = n2
        switch (type) {
            case Fragment:
                processFragment(n1,n2, container, parentComponent,anchor)
                break
            case Text:
                processText(n1,n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1,n2, container, parentComponent,anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1,n2, container, parentComponent,anchor)
                }
        }
    }

    function processText(n1,n2, container) {
        const {children} = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(n1,n2, container, parentComponent,anchor) {
        mountChildren(n2.children, container, parentComponent,anchor)
    }

    function processElement(n1,n2, container, parentComponent,anchor) {
        if(!n1){
            mountElement(n2, container, parentComponent,anchor)
        }
        else {
            patchElement(n1,n2, container,parentComponent,anchor)
        }
    }

    function patchElement(n1,n2,container,parentComponent,anchor){
        console.log('patchElement')
        console.log('n1',n1)
        console.log('n2',n2)

        const oldProps=n1.props || EMPTY_OBJ
        const newProps=n2.props || EMPTY_OBJ
        const el=n2.el=n1.el
        patchChildren(n1,n2,el,parentComponent,anchor)
        patchProps(el,oldProps,newProps)

    }
    function patchChildren(n1,n2,container,parentComponent,anchor){
        const preShapeFlag=n1.shapeFlag
        const oldChildren=n1.children
        const {shapeFlag}=n2
        const newChildren=n2.children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN){
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN){
                //remove old element and set text element
                unmountChildren(oldChildren)
                // hostSetTextElement(container,newChildren)
            }
            if (oldChildren!==newChildren){
                hostSetTextElement(container,newChildren)
        }
        } else {
            if (preShapeFlag & ShapeFlags.TEXT_CHILDREN){
                hostSetTextElement(container,'')
                mountChildren(newChildren,container,parentComponent,anchor)
            } else {
                //array to array
                patcheKeydChildren(oldChildren,newChildren,container,parentComponent,anchor)
            }

        }
    }

    function isSomeVNodeType(n1,n2){
        return n1.type===n2.type && n1.key === n2.key
    }

    function patcheKeydChildren(oldChildren,newChildren,container,parentComponent,parentAnchor){
        let i=0
        const l2=newChildren.length
        let e1=oldChildren.length-1
        let e2=l2-1
        //left side compare
        while (i<=e1 && i<=e2){
            const n1=oldChildren[i]
            const n2=newChildren[i]

            if (isSomeVNodeType(n1,n2)){
                patch(n1,n2,container,parentComponent,parentAnchor)
            } else {
                break
            }
            i++
        }
        //right side compare
        while (i<=e1 && i<=e2){
            const n1=oldChildren[e1]
            const n2=newChildren[e2]

            if (isSomeVNodeType(n1,n2)){
                patch(n1,n2,container,parentComponent,parentAnchor)
            } else {
                break
            }
            e1--
            e2--
        }
        //new is longer than old
        if (i>e1){
            if (i<=e2){
                const nextPos=e2+1
                const anchor=i+1<l2?newChildren[nextPos].el:null
                while (i<=e2){
                    patch(null,newChildren[i],container,parentComponent,anchor)
                    i++
                }

            }
        }
        //new is shorter than old
        if (i>e2){
            while (i<=e1){
                hostRemove(oldChildren[i].el)
                i++
            }
        }
    }

    function unmountChildren(children){
        for (let i=0;i<children.length;i++){
            const el=children[i].el
            hostRemove(el)
        }
    }
    function patchProps(el,oldProps,newProps){
        if (oldProps!==newProps){
            for (const key in newProps){
                const preProp=oldProps[key]
                const nextProp=newProps[key]
                if (oldProps!==newProps){
                    hostPatchProp(el,key,preProp,nextProp)
                }
            }
            if (oldProps.length!==EMPTY_OBJ){
                for (const key in oldProps){
                    if (!(key in newProps)){
                        hostPatchProp(el,key,oldProps[key],null)
                    }
                }
            }
        }


    }

    function mountElement(vnode, container, parentComponent,anchor) {
        //vnode.children -> string / array
        // const el=vnode.el=document.createElement(vnode.type)
        const el = vnode.el = hostCreateElement(vnode.type)
        const {children, shapeFlag} = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent,anchor)
        }
        const {props} = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null,val)

        }
        // container.append(el)
        hostInsert(el, container,anchor)
    }

    function mountChildren(children, container, parentComponent,anchor) {
        children.forEach(child => {
            patch(null,child, container, parentComponent,anchor)
        })
    }

    function processComponent(n1,n2, container, parentComponent,anchor) {
        mountComponent(n2, container, parentComponent,anchor)
    }

    function mountComponent(initialVnode, container, parentComponent,anchor) {
        const instance = createComponentInstance(initialVnode, parentComponent)
        setUpComponent(instance)
        setupRenderEffect(instance, initialVnode, container,anchor)
    }

    function setupRenderEffect(instance, initialVnode, container,anchor) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init')
                const {proxy} = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                //subTree -> vnode -> patch - element -> mountElement
                patch(null,subTree, container, instance,anchor)
                //all elements -> mount
                initialVnode.el = subTree.el
                instance.isMounted = true
            } else {
                console.log('update')
                const {proxy} = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree,subTree, container, instance,anchor)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}


