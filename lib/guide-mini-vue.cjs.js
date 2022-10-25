'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props === null || props === void 0 ? void 0 : props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function toDisplayString(value) {
    return String(value);
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
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

const extend = Object.assign;
const EMPTY_OBJ = {};
function isString(value) {
    return typeof value === 'string';
}
function isObject(val) {
    return val !== null && typeof val === 'object';
}
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHanlderkey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    //$slots
    $slots: (i) => i.slots,
    //$emit
    $emit: (i) => i.emit,
    $props: (i) => i.props
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // if (key==='$el'){
        //     return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function emit(instance, event, ...args) {
    console.log('emit event', event);
    const { props } = instance;
    //TPP
    //First special function then general function
    const handlerName = toHanlderkey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// @ts-ignore
let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true; //This is the flag whether stop function has been already called
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        //should track or collect side effect
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        //reset shouldTrack status
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
const targetMap = new WeakMap();
function track(target, key) {
    // if (!activeEffect) return
    // if (!shouldTrack) return
    if (!isTracking())
        return;
    //use target as key to get depsMap, and use key to get dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (depsMap) {
        let dep = depsMap.get(key);
        triggerEffects(dep);
    }
}
function triggerEffects(dep) {
    if (dep) {
        dep.forEach(effect => {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        });
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop=options.onStop
    // Object.assign(_effect,options)
    //extend
    extend(_effect, options); //This is same as line 72
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner['effect'] = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
const readOnlySet = createSetter(true);
const shallowReadOnlyGet = createGetter(true, true);
const shallowReadOnlySet = createSetter(true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        //This part is used to check whether data is read only or is reactive
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadOnly" /* ReactiveFlags.IS_READONLY */) {
            return isReadOnly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        //collect deps
        if (!isReadOnly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter(isReadOnly = false) {
    return function set(target, key, value) {
        if (isReadOnly) {
            console.warn(`${key} set failed, because target is readonly`, target);
            return true;
        }
        const res = Reflect.set(target, key, value);
        //trigger deps
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readOnlyHandlers = {
    get: readOnlyGet,
    set: readOnlySet
};
const shallowReadonlyHandlers = {
    get: shallowReadOnlyGet,
    set: shallowReadOnlySet
};

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadOnly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readOnlyHandlers);
}
function shallowReadOnly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn('target must be an Object');
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        //take care of edge case for Object value
        //1. value is Object or not
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        //take care of edge case for Object value
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    if (isRef(ref)) {
        return ref.value;
    }
    return ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                target[key].value = value;
                return true;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

// import {proxyRefs} from "../reactivity";
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        parent,
        isMounted: false,
        next: null,
        provides: parent ? parent.provides : {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setUpComponent(instance) {
    // initProps()
    initProps(instance, instance.vnode.props);
    // initSlots()
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
let currentInstance = null;
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setUpResult = setup(shallowReadOnly(instance.props), { emit: instance.emit });
        handleSetupResult(instance, setUpResult);
    }
    setCurrentInstance(null);
}
function handleSetupResult(instance, setUpResult) {
    if (typeof setUpResult === 'object') {
        instance.setupState = proxyRefs(setUpResult);
    }
    finishComponentSetUp(instance);
}
function finishComponentSetUp(instance) {
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, value) {
    //save
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        //init operation
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    //read
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // vnode
                //all following operation base on vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function shouldUpdateComponent(preVNode, nextVNode) {
    const { props: preProps } = preVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
function nextTick(fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
    // Promise.resolve().then(()=>{
    //     flushJobs()
    // })
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setTextElement: hostSetTextElement } = options;
    function render(vnode, container, parentComponent) {
        //call patch function
        patch(null, vnode, container, parentComponent, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        //process component
        //if vnode is element, call processElement
        //shapeFlag
        //vnode->flag
        //element
        //Fragment is only used for rendering children
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = n2.el = n1.el;
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const preShapeFlag = n1.shapeFlag;
        const oldChildren = n1.children;
        const { shapeFlag } = n2;
        const newChildren = n2.children;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (preShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                //remove old element and set text element
                unmountChildren(oldChildren);
                // hostSetTextElement(container,newChildren)
            }
            if (oldChildren !== newChildren) {
                hostSetTextElement(container, newChildren);
            }
        }
        else {
            if (preShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetTextElement(container, '');
                mountChildren(newChildren, container, parentComponent, anchor);
            }
            else {
                //array to array
                patcheKeydChildren(oldChildren, newChildren, container, parentComponent, anchor);
            }
        }
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patcheKeydChildren(oldChildren, newChildren, container, parentComponent, parentAnchor) {
        let i = 0;
        const l2 = newChildren.length;
        let e1 = oldChildren.length - 1;
        let e2 = l2 - 1;
        //left side compare
        while (i <= e1 && i <= e2) {
            const n1 = oldChildren[i];
            const n2 = newChildren[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        //right side compare
        while (i <= e1 && i <= e2) {
            const n1 = oldChildren[e1];
            const n2 = newChildren[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        //new is longer than old
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = i + 1 < l2 ? newChildren[nextPos].el : null;
                while (i <= e2) {
                    patch(null, newChildren[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            //new is shorter than old
            while (i <= e1) {
                hostRemove(oldChildren[i].el);
                i++;
            }
        }
        else {
            //process middle elements
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = newChildren[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = oldChildren[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                //with key
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    //without key
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, newChildren[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex == undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        //flag
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, newChildren[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = newChildren[nextIndex];
                const anchor = nextIndex + 1 < l2 ? newChildren[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log('move position', i);
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const preProp = oldProps[key];
                const nextProp = newProps[key];
                if (oldProps !== newProps) {
                    hostPatchProp(el, key, preProp, nextProp);
                }
            }
            if (oldProps.length !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        //vnode.children -> string / array
        // const el=vnode.el=document.createElement(vnode.type)
        const el = vnode.el = hostCreateElement(vnode.type);
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el)
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(child => {
            patch(null, child, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = n2.component = n1.component;
        if (shouldUpdateComponent(n1, n2)) {
            console.log('update component');
            instance.next = n2;
            instance.update();
        }
        else {
            console.log('no update component');
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        const instance = initialVnode.component = createComponentInstance(initialVnode, parentComponent);
        setUpComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                //subTree -> vnode -> patch - element -> mountElement
                patch(null, subTree, container, instance, anchor);
                //all elements -> mount
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                //update props
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log('update-scheduler');
                queueJobs(instance.update);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, preVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, container, anchor) {
    // container.append(el)
    container.insertBefore(el, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setTextElement(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setTextElement
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var runtimedom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVNode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString
});

var TagType;
(function (TagType) {
    TagType[TagType["Start"] = 0] = "Start";
    TagType[TagType["End"] = 1] = "End";
})(TagType || (TagType = {}));
function baseParse(content) {
    const context = createParseContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        console.log('s: ', s);
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
                console.log('is element');
            }
        }
        if (!node) {
            node = parseText(context);
        }
        console.log('node: ', node);
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestor) {
    //source meet element end tag
    const s = context.source;
    console.log('isEnd: ', s);
    if (s.startsWith('</')) {
        for (let i = ancestor.length - 1; i >= 0; i--) {
            const tag = ancestor[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    //source has value
    return !s;
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}
function parseText(context) {
    // const content=context.source.slice(0,context.source.length)
    // advanceBy(context,content.length)
    let endIndex = context.source.length;
    let endTokens = ['<', "{{"];
    for (let i = 0; i <= endTokens.length - 1; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    console.log('text: ', content);
    console.log('after text', context.source);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content
    };
}
function parseTag(context, type) {
    console.log('before match: ', context.source);
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    console.log('match: ', match);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === 1 /* TagType.End */)
        return;
    console.log('advance element source', context.source);
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag
    };
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    //remove end tag
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`Lack end tag: ${element.tag}`);
    }
    console.log('-----------------', context.source);
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function parseInterpolation(context) {
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    console.log('context source', context.source);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    console.log('rawContent: ', rawContent);
    const content = rawContent.trim();
    console.log('content: ', content);
    advanceBy(context, closeDelimiter.length);
    console.log('remove source: ', context.source);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content
        }
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function createParseContext(content) {
    return {
        source: content
    };
}
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */
    };
}

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
const helperMapName = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

function transform(root, options = {}) {
    console.log('original root: ', root);
    const context = createTransformContext(root, options);
    //深度优先搜索
    tranverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
    console.log('root: ', root);
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === 2 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}
function tranverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            tranverseChildren(node, context);
            break;
    }
    // tranverseChildren(node,context)
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function tranverseChildren(parent, context) {
    const children = parent.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            tranverseNode(node, context);
        }
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}

function generate(ast) {
    console.log('ast', ast);
    const context = createCodegenContext();
    const { push } = context;
    getFunctionPreamble(ast, context);
    const functionName = 'render';
    const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options'];
    const signature = args.join(', ');
    // const node=ast.codegenNode
    push(`function ${functionName}(${signature}){`);
    genNode(ast.codegenNode, context);
    push('}');
    console.log(context.code);
    return {
        code: context.code
    };
    // return {
    //     code: `return function render(_ctx,_cache,$props,$setup,$data,$options){return "hi"}`
    // }
}
function getFunctionPreamble(ast, context) {
    const { push } = context;
    const vueBing = 'Vue';
    const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${vueBing}`);
    }
    push('\n');
    push('return ');
}
function genNode(node, context) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            getExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOND_EXPRESSION */:
            getCompoundExpression(node, context);
            break;
    }
}
function getCompoundExpression(node, context) {
    const { push } = context;
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullLable([tag, props, children]), context);
    push(")");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString((node))) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(',');
        }
    }
}
function genNullLable(args) {
    return args.map((arg) => arg || "null");
}
function genText(node, context) {
    const { push } = context;
    push(`"${node.content}"`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(')');
}
function getExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}

function transformExpresssion(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["INTERPOLATION"] = 0] = "INTERPOLATION";
    NodeTypes[NodeTypes["SIMPLE_EXPRESSION"] = 1] = "SIMPLE_EXPRESSION";
    NodeTypes[NodeTypes["ELEMENT"] = 2] = "ELEMENT";
    NodeTypes[NodeTypes["TEXT"] = 3] = "TEXT";
    NodeTypes[NodeTypes["ROOT"] = 4] = "ROOT";
    NodeTypes[NodeTypes["COMPOND_EXPRESSION"] = 5] = "COMPOND_EXPRESSION";
})(NodeTypes || (NodeTypes = {}));
function createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren) {
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag: vnodeTag,
        props: vnodeProps,
        children: vnodeChildren
    };
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE);
            const vnodeTag = `"${node.tag}"`;
            let vNodeProps;
            const children = node.children;
            let vnodeChildren = children[0];
            // const vnodeElement = {
            //     type:NodeTypes.ELEMENT,
            //     tag:vnodeTag,
            //     props:vNodeProps,
            //     children:vnodeChildren
            // }
            node.codegenNode = createVNodeCall(context, vnodeTag, vNodeProps, vnodeChildren);
        };
    }
}

function isText(node) {
    return node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
}

function transformText(node) {
    let currentContainer;
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const { children } = node;
            for (let i = 0; i < children.length; i++) {
                const child = children[0];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push('+');
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpresssion, transformElement, transformText]
    });
    return generate(ast);
}

//mini-vue output
function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function('Vue', code)(runtimedom);
    return render;
    // function renderFunction(Vue) {
    //     const {toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, openBlock: _openBlock} = Vue
    //     return function render(_ctx, _cache, $props, $setup, $data, $options){
    //         _createElementVNode("div",null,"hi, "+_toDisplayString(ctx_.message))
    //     }
    //
    // }
}
registerRuntimeCompiler(compileToFunction);

exports.createApp = createApp;
exports.createElementVNode = createVNode;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlots = renderSlots;
exports.toDisplayString = toDisplayString;
