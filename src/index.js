import VDOMNode from './vdom-node';
import createVDOMNode from './create-vdom-node';
import updateNode from './update-node';

const vdom = {
    h: createVDOMNode,
    createVDOMNode,
    VDOMNode,
    updateNode
};

if (typeof window !== 'undefined') {
    window.vdom = vdom;
}

export default vdom;
