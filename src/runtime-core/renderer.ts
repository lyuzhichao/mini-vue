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
        patch(null,vnode, container, parentComponent)
    }

    function patch(n1,n2, container, parentComponent) {
        //process component
        //if vnode is element, call processElement
        //shapeFlag
        //vnode->flag
        //element
        //Fragment is only used for rendering children
        const {shapeFlag, type} = n2
        switch (type) {
            case Fragment:
                processFragment(n1,n2, container, parentComponent)
                break
            case Text:
                processText(n1,n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1,n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1,n2, container, parentComponent)
                }
        }
    }

    function processText(n1,n2, container) {
        const {children} = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(n1,n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processElement(n1,n2, container, parentComponent) {
        if(!n1){
            mountElement(n2, container, parentComponent)
        }
        else {
            patchElement(n1,n2, container,parentComponent)
        }
    }

    function patchElement(n1,n2,container,parentComponent){
        console.log('patchElement')
        console.log('n1',n1)
        console.log('n2',n2)

        const oldProps=n1.props || EMPTY_OBJ
        const newProps=n2.props || EMPTY_OBJ
        const el=n2.el=n1.el
        patchChildren(n1,n2,el,parentComponent)
        patchProps(el,oldProps,newProps)

    }
    function patchChildren(n1,n2,container,parentComponent){
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
                mountChildren(newChildren,container,parentComponent)
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

    function mountElement(vnode, container, parentComponent) {
        //vnode.children -> string / array
        // const el=vnode.el=document.createElement(vnode.type)
        const el = vnode.el = hostCreateElement(vnode.type)
        const {children, shapeFlag} = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent)
        }
        const {props} = vnode
        for (const key in props) {
            const val = props[key]
            // const isOn = (key) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     el.addEventListener(key.slice(2).toLowerCase(), val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            hostPatchProp(el, key, null,val)

        }
        // container.append(el)
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(child => {
            patch(null,child, container, parentComponent)
        })
    }

    function processComponent(n1,n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)
        setUpComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init')
                const {proxy} = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                //subTree -> vnode -> patch - element -> mountElement
                patch(null,subTree, container, instance)
                //all elements -> mount
                initialVnode.el = subTree.el
                instance.isMounted = true
            } else {
                console.log('update')
                const {proxy} = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree,subTree, container, instance)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}


