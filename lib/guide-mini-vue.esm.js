function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setUpComponent(instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        const setUpResult = setup();
        handleSetupResult(instance, setUpResult);
    }
}
function handleSetupResult(instance, setUpResult) {
    if (typeof setUpResult === 'object') {
        instance.setupState = setUpResult;
    }
    finishComponentSetUp(instance);
}
function finishComponentSetUp(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    //call patch function
    patch(vnode);
}
function patch(vnode, container) {
    //process component
    //if vnode is element, call processElement
    // processElement()
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setUpComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    //subTree -> vnode -> patch - element -> mountElement
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // vnode
            //all following operation base on vnode
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
