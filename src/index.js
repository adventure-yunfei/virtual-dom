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
        children = children.map((child, idx) => {
            if (typeof child === 'string') {
                child = new VDOMTextNode(child);
            }
            if (child.key === '_tmp_') {
                child.setKey(`.${idx}`);
            }
            return child;
        });

        let key = null;
        if (attributes && attributes.key != null) {
            key = attributes.key;
            delete attributes.key;
        }

        const vdomNode = new VDOMNode(type, attributes, children);
        if (key) {
            vdomNode.setKey(key);
        }
        return vdomNode;
    }
};

if (typeof window !== 'undefined') {
    window.vdom = vdom;
}

export default vdom;
