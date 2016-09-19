import {VDOMNode, VDOMTextNode} from './vdom-node';
import findDiff from './find-diff';
import applyDiff from './apply-diff';

const vdom = {
    findDiff,

    applyDiff,

    updateNode(containerDOM, oldVNode, newVNode) {
        applyDiff(findDiff(containerDOM, oldVNode, newVNode));
    },

    createVDOMNode(type, attributes, ...children) {
        children.forEach((child, idx) => {
            if (typeof child === 'string') {
                children[idx] = new VDOMTextNode(child);
            }
        });
        return new VDOMNode(type, attributes, children);
    }
};

if (typeof window !== 'undefined') {
    window.vdom = vdom;
}

export default vdom;
