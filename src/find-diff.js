import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import has from 'lodash/has';
import * as DiffTypes from './diff-types';
import findKeysDiff, {KEY_DIFF_TYPES} from './find-keys-diff';

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

    if (delAttrKeys.length) {
        diffs.push(new DiffTypes.RemoveAttributeDiff(null, dom, delAttrKeys));
    }
    if (!isEmpty(setAttrs)) {
        diffs.push(new DiffTypes.SetAttributeDiff(null, dom, setAttrs));
    }
}

function diffChildren(diffs, dom, oldChildren, newChildren) {
    const oldKeys = [],
        oldKeyIdxMap = {},
        newKeys = [],
        newChildMap = {},
        childDOMs = dom.childNodes;
    oldChildren.forEach(({key}, idx) => {
        oldKeys.push(key);
        oldKeyIdxMap[key] = idx;
    });
    newChildren.forEach(child => {
        newKeys.push(child.key);
        newChildMap[child.key] = child;
    });

    // Searching for dom insert/delete/move
    const keyDiffs = findKeysDiff(oldKeys, newKeys);
    keyDiffs.forEach(({type, key, next}) => {
        switch (type) {
            case KEY_DIFF_TYPES.INSERT_KEY:
                diffs.push(new DiffTypes.InsertNodeDiff(
                    dom,
                    null,
                    childDOMs[oldKeyIdxMap[next]],
                    newChildMap[key]
                ));
                break;
            case KEY_DIFF_TYPES.DELETE_KEY:
                diffs.push(new DiffTypes.RemoveNodeDiff(
                    dom,
                    childDOMs[oldKeyIdxMap[key]]
                ));
                break;
            case KEY_DIFF_TYPES.MOVE_KEY:
                diffs.push(new DiffTypes.MoveNodeDiff(
                    dom,
                    childDOMs[oldKeyIdxMap[key]],
                    childDOMs[oldKeyIdxMap[next]]
                ));
        }
    });

    // Searching for dom replace/update
    oldChildren.forEach((oldChild, idx) => {
        const key = oldChild.key,
            newChild = newChildMap[key];
        if (newChild != null) {
            const oldType = oldChild.type,
                newType = newChild.type,
                tgtDOM = dom.childNodes[idx];
            if (oldType !== newType || (oldType === TYPE_TEXT && oldChild !== newChild)) {
                diffs.push(new DiffTypes.ReplaceNodeDiff(dom, tgtDOM, newChild));
            } else if (oldType !== TYPE_TEXT) {
                diffAttributes(diffs, tgtDOM, oldChild.attributes, newChild.attributes);
                diffChildren(diffs, tgtDOM, oldChild.children, newChild.children);
            }
        }
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
