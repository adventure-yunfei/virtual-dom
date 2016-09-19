import isArray from 'lodash/isArray';
import forEach from 'lodash/forEach';

export const TYPE_TEXT_NODE = '_text';

export class VDOMNode {
    constructor(type, attributes = {}, children = []) {
        this.type = type;
        this.attributes = attributes || {};
        this.children = children == null ? [] : (isArray(children) ? children : [children]);
    }

    createDOM() {
        const {type, attributes, children} = this,
            dom = document.createElement(type);

        if (attributes) {
            forEach(attributes, (val, key) => {
                dom.setAttribute(key, val);
            });
        }

        if (children) {
            forEach(children, (childVDOMNode, idx) => {
                dom.appendChild(childVDOMNode.createDOM());
            });
        }

        return dom;
    }
}

export class VDOMTextNode extends VDOMNode {
    constructor(text) {
        super(TYPE_TEXT_NODE, {content: text});
    }

    createDOM() {
        return document.createTextNode(this.attributes.content);
    }
}
