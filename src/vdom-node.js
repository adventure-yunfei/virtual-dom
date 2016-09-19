import isArray from 'lodash/isArray';

export default class VDOMNode {
    constructor(type, attributes = {}, children = []) {
        this.type = type;
        this.attributes = attributes || {};
        this.children = children == null ? [] : (isArray(children) ? children : [children]);
    }
}