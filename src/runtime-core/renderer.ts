import {createComponentInstance, setUpComponent} from "./component";
import {EMPTY_OBJ,ShapeFlags} from "../shared";
// import {ShapeFlags} from "../shared/shapeFlags";
import {Fragment, Text} from "./vnode";
import {createAppAPI} from "./createApp";
import {effect} from "../reactivity/effect";
import {shouldUpdateComponent} from "./componentUpdateUtils";
import {queueJobs} from "./scheduler";

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

    function isSameVNodeType(n1,n2){
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

            if (isSameVNodeType(n1,n2)){
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

            if (isSameVNodeType(n1,n2)){
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
        } else if (i>e2){
            //new is shorter than old
            while (i<=e1){
                hostRemove(oldChildren[i].el)
                i++
            }
        } else {
            //process middle elements
            let s1=i
            let s2=i
            const toBePatched=e2-s2+1
            let patched=0
            const keyToNewIndexMap=new Map()
            const newIndexToOldIndexMap=new Array(toBePatched)
            let moved=false
            let maxNewIndexSoFar=0

            for (let i=0;i<toBePatched;i++){
                newIndexToOldIndexMap[i]=0
            }

            for (let i=s2;i<=e2;i++){
                const nextChild=newChildren[i]
                keyToNewIndexMap.set(nextChild.key,i)
            }
            for (let i=s1;i<=e1;i++){
                const prevChild=oldChildren[i]

                if (patched>=toBePatched){
                    hostRemove(prevChild.el)
                    continue
                }
                
                let newIndex
                //with key
                if (prevChild.key!==null){
                    newIndex=keyToNewIndexMap.get(prevChild.key)
                } else {
                    //without key
                    for (let j=s2;j<=e2;j++){
                        if (isSameVNodeType(prevChild,newChildren[j])){
                            newIndex=j
                            break
                        }
                    }
                }
                if (newIndex==undefined){
                    hostRemove(prevChild.el)
                } else {
                    if (newIndex>=maxNewIndexSoFar){
                        maxNewIndexSoFar=newIndex
                    } else {
                        //flag
                        moved=true
                    }
                    newIndexToOldIndexMap[newIndex-s2]=i+1
                    patch(prevChild,newChildren[newIndex],container,parentComponent,null)
                    patched++
                }
            }

            const increasingNewIndexSequence=moved?getSequence(newIndexToOldIndexMap):[]
            let j=increasingNewIndexSequence.length-1
            for (let i=toBePatched-1;i>=0;i--){
                const nextIndex=i+s2
                const nextChild=newChildren[nextIndex]
                const anchor=nextIndex+1<l2?newChildren[nextIndex+1].el:null

                if (newIndexToOldIndexMap[i]===0){
                    patch(null,nextChild,container,parentComponent,anchor)
                }

                if (moved){
                    if (j<0 || i!==increasingNewIndexSequence[j]){
                        console.log('move position',i)
                        hostInsert(nextChild.el,container,anchor)
                    } else {
                        j--
                    }
                }

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
        if (!n1){
            mountComponent(n2, container, parentComponent,anchor)
        } else {
            updateComponent(n1,n2)
        }
    }
    function updateComponent(n1,n2){
        const instance=n2.component=n1.component
        if (shouldUpdateComponent(n1,n2)){
            console.log('update component')
            instance.next=n2
            instance.update()
        } else {
            console.log('no update component')
            n2.el=n1.el
            instance.vnode=n2
        }

    }

    function mountComponent(initialVnode, container, parentComponent,anchor) {
        const instance = initialVnode.component=createComponentInstance(initialVnode, parentComponent)
        setUpComponent(instance)
        setupRenderEffect(instance, initialVnode, container,anchor)
    }

    function setupRenderEffect(instance, initialVnode, container,anchor) {
        instance.update=effect(() => {
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
                //update props
                const {next,vnode}=instance
                if (next){
                    next.el=vnode.el
                    updateComponentPreRender(instance,next)
                }

                const {proxy} = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree,subTree, container, instance,anchor)
            }
        },{
            scheduler(){
                console.log('update-scheduler')
                queueJobs(instance.update)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }
}

function updateComponentPreRender(instance,nextVNode){

    instance.vnode=nextVNode
    instance.next=null
    instance.props=nextVNode.props
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}