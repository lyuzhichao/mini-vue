import {createComponentInstance,setUpComponent} from "./component";
// @ts-ignore
import {isObject} from "../shared";
import {ShapeFlags} from "../shared/shapeFlags";
import {Fragment,Text} from "./vnode";
import {createAppAPI} from "./createApp";

export function createRenderer(options) {
    const {
        createElement,
        patchProp,
        insert
    } = options

    function render(vnode, container, parentComponent) {
        //call patch function
        patch(vnode, container, parentComponent)
    }

    function patch(vnode, container, parentComponent=null) {
        //process component
        //if vnode is element, call processElement
        //shapeFlag
        //vnode->flag
        //element
        //Fragment is only used for rendering children
        const {shapeFlag, type} = vnode
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break
            case Text:
                processText(vnode, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
        }
    }

    function processText(vnode, container) {
        const {children} = vnode
        const textNode = (vnode.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode, container, parentComponent) {
        //vnode.children -> string / array
        // const el=vnode.el=document.createElement(vnode.type)
        const el = vnode.el = createElement(vnode.type)
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
            patchProp(el,key,val)

        }
        // container.append(el)
        insert(el,container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(child => {
            patch(child, container, parentComponent)
        })
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)
        setUpComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance, initialVnode, container) {
        const {proxy} = instance
        const subTree = instance.render.call(proxy)
        //subTree -> vnode -> patch - element -> mountElement
        patch(subTree, container, instance)
        //all elements -> mount
        initialVnode.el = subTree.el
    }

    return {
        createApp:createAppAPI(render)
    }
}


