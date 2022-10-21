import {createComponentInstance, setUpComponent} from "./component";
import {isObject} from "../shared";
import {ShapeFlags} from "../shared/shapeFlags";
import {Fragment, Text} from "./vnode";
import {createAppAPI} from "./createApp";
import {effect} from "../reactivity/effect";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
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
        mountChildren(n2, container, parentComponent)
    }

    function processElement(n1,n2, container, parentComponent) {
        if(!n1){
            mountElement(n2, container, parentComponent)
        }
        else {
            patchElement(n1,n2, container)
        }
    }

    function patchElement(n1,n2,container){
        console.log('patchElement')
        console.log('n1',n1)
        console.log('n2',n2)
    }

    function mountElement(vnode, container, parentComponent) {
        //vnode.children -> string / array
        // const el=vnode.el=document.createElement(vnode.type)
        const el = vnode.el = hostCreateElement(vnode.type)
        const {children, shapeFlag} = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
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
            hostPatchProp(el, key, val)

        }
        // container.append(el)
        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(child => {
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


