// Algorithm to find difference between two unique string arrays
// e.g. findKeysDiff(['a', 'b', 'c', 'd'], ['c', 'a', 'b', 'd'])

import isEqual from 'lodash/isEqual';

export const KEY_DIFF_TYPES = {
    MOVE_KEY: 'm',
    INSERT_KEY: 'i',
    DELETE_KEY: 'd'
};

function buildKeyIdxMap(keys) {
    const idxMap = {};
    keys.forEach((key, idx) => idxMap[key] = idx);
    return idxMap;
}
export default function findKeysDiff(oldKeys, newKeys) {
    const moveDiffs = [],
        insertDiffs = [],
        deleteDiffs = [],
        oldKeyIdxMap = buildKeyIdxMap(oldKeys),
        newKeyIdxMap = buildKeyIdxMap(newKeys),
        oldCommonKeys = [],
        newCommonKeys = [];

    oldKeys.forEach(oldKey => {
        if (newKeyIdxMap[oldKey] != null) {
            oldCommonKeys.push(oldKey);
        } else {
            deleteDiffs.push({
                type: KEY_DIFF_TYPES.DELETE_KEY,
                key: oldKey
            });
        }
    });

    newKeys.forEach(newKey => {
        if (oldKeyIdxMap[newKey] != null) {
            newCommonKeys.push(newKey);
        } else {
            const len = newCommonKeys.length;
            insertDiffs.unshift({
                type: KEY_DIFF_TYPES.INSERT_KEY,
                key: newKey,
                prev: len ? newCommonKeys[len - 1] : null
            });
        }
    });

    const currCommonKeys = oldCommonKeys.concat();
    let currKeyIdxMap = buildKeyIdxMap(currCommonKeys);
    newCommonKeys.forEach((newKey, newIdx) => {
        const currIdx = currKeyIdxMap[newKey],
            currPrevKey = currCommonKeys[currIdx - 1],
            newPrevKey = newCommonKeys[newIdx - 1];
        if (currPrevKey !== newPrevKey) {
            moveDiffs.push({
                type: KEY_DIFF_TYPES.MOVE_KEY,
                key: newKey,
                prev: newPrevKey
            });

            const currPrevIdx = currKeyIdxMap[newPrevKey];
            currCommonKeys.splice(currIdx, 1);
            currCommonKeys.splice(currPrevIdx == null ? 0 : currPrevIdx < currIdx ? currPrevIdx + 1 : currPrevIdx + 2, 0 , newKey);
            currKeyIdxMap = buildKeyIdxMap(currCommonKeys);
        }
    });

    return moveDiffs.concat(insertDiffs).concat(deleteDiffs);
}

export function testDiffs(oldKeys, newKeys, diffs) {
    let result = true;
    const currKeys = oldKeys.concat(),
        keyIdx = key => {
            const idx = currKeys.indexOf(key);
            if (idx === -1) {
                result = false;
            }
            return idx;
        };
    diffs.forEach(({type, key, prev}) => {
        switch (type) {
            case KEY_DIFF_TYPES.INSERT_KEY:
                currKeys.splice(prev == null ? 0 : (keyIdx(prev) + 1), 0, key);
                break;
            case KEY_DIFF_TYPES.DELETE_KEY:
                currKeys.splice(keyIdx(key), 1);
                break;
            case KEY_DIFF_TYPES.MOVE_KEY:
                currKeys.splice(keyIdx(key), 1);
                currKeys.splice(prev == null ? 0 : (keyIdx(prev) + 1), 0, key);
        }
    });

    result = result && isEqual(currKeys, newKeys);

    return result;
}
