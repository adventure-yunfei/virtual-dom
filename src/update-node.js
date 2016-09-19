import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import VDOMNode from './vdom-node';

const TYPE_TEXT = '_text';

function getVNodeType(vdomNode) {
    return isString(vdomNode) ? TYPE_TEXT : vdomNode.type;
}

function createDOM(vdomNode) {
    const type = getVNodeType(vdomNode);
    if (type === TYPE_TEXT) {
        return document.createTextNode(vdomNode);
    } else {
        const {type, attributes, children} = vdomNode,
            dom = document.createElement(type);

        if (attributes) {
            forEach(attributes, (val, key) => {
                dom.setAttribute(key, val);
            });
        }

        if (children) {
            forEach(children, (childVDOMNode, idx) => {
                dom.appendChild(createDOM(childVDOMNode));
            });
        }

        return dom;
    }
}

function updateDOMAttributes(dom, oldAttrs, newAttrs) {
    forEach(oldAttrs, (val, key) => {
        if (!has(newAttrs, key)) {
            dom.removeAttribute(key);
        }
    });
    forEach(newAttrs, (val, key) => {
        if (val !== oldAttrs[key]) {
            dom.setAttribute(key, val);
        }
    });
}

function updateDOMChildren(dom, oldChildren, newChildren) {
    forEach(oldChildren, (child, idx) => {
        const newChild = newChildren[idx];
        if (newChild == null) {
            dom.removeChild(dom.childNodes[idx]);
        } else {
            const type = getVNodeType(child),
                newType = getVNodeType(newChild);
            if (type !== newType || (type === TYPE_TEXT && child !== newChild)) {
                dom.replaceChild(createDOM(newChild), dom.childNodes[idx]);
            } else if (type !== TYPE_TEXT) {
                updateDOMAttributes(dom.childNodes[idx], child.attributes, newChild.attributes);
                updateDOMChildren(dom.childNodes[idx], child.children, newChild.children);
            }
        }
    });

    newChildren.slice(oldChildren.length).forEach(newChild => {
        dom.appendChild(createDOM(newChild));
    });
}

export default function updateDOMNode(containerDOM, oldVNode, newVNode) {
    updateDOMChildren(
        containerDOM,
        oldVNode ? [oldVNode] : [],
        newVNode ? [newVNode] : []
    );
}
