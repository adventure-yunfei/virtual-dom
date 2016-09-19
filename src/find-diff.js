import forEach from 'lodash/forEach';
import has from 'lodash/has';
import * as DiffTypes from './diff-types';

const TYPE_TEXT = '_text';

function diffAttributes(diffs, dom, oldAttrs, newAttrs) {
    const delAttrKeys = [],
        setAttrs = {};
    forEach(oldAttrs, (val, key) => {
        if (!has(newAttrs, key)) {
            delAttrKeys.push(key);
        }
    });
    forEach(newAttrs, (val, key) => {
        if (val !== oldAttrs[key]) {
            setAttrs[key] = val;
        }
    });

    diffs.push(new DiffTypes.RemoveAttributeDiff(null, null, dom, delAttrKeys));
    diffs.push(new DiffTypes.SetAttributeDiff(null, null, dom, setAttrs));
}

function diffChildren(diffs, dom, oldChildren, newChildren) {
    forEach(oldChildren, (child, idx) => {
        const newChild = newChildren[idx],
            tgtDOM = dom.childNodes[idx];
        if (newChild == null) {
            diffs.push(new DiffTypes.RemoveNodeDiff(child, dom, tgtDOM));
        } else {
            const type = child.type,
                newType = newChild.type;
            if (type !== newType || (type === TYPE_TEXT && child !== newChild)) {
                diffs.push(new DiffTypes.ReplaceNodeDiff(newChild, dom, tgtDOM));
            } else if (type !== TYPE_TEXT) {
                diffAttributes(diffs, tgtDOM, child.attributes, newChild.attributes);
                diffChildren(diffs, tgtDOM, child.children, newChild.children);
            }
        }
    });

    newChildren.slice(oldChildren.length).forEach(newChild => {
        diffs.push(new DiffTypes.InsertNodeDiff(newChild, dom, null));
    });
}

export default function findDiff(containerDOM, oldVNode, newVNode) {
    const diffs = [];
    diffChildren(
        diffs,
        containerDOM,
        oldVNode ? [oldVNode] : [],
        newVNode ? [newVNode] : []
    );
    return diffs;
}
