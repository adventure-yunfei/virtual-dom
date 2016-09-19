import VDOMNode from './vdom-node';

export default function createVDOMNode(type, attributes = {}, children = []) {
    return new VDOMNode(type, attributes, children);
}