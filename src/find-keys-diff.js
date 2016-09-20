// Algorithm to find difference between two unique string arrays
// e.g. findKeysDiff(['a', 'b', 'c', 'd'], ['c', 'a', 'b', 'd'])

export const KEY_DIFF_TYPES = {
    MOVE_KEY: 'm',
    INSERT_KEY: 'i',
    DELETE_KEY: 'd'
};

export default function findKeysDiff(oldKeys, newKeys) {
    const diffs = [],
        oldKeyIdxMap = {};
    oldKeys.forEach((oldKey, idx) => oldKeyIdxMap[oldKey] = idx);

    const findNextOldKeyInNewKeys = newKeyIdx => {
        const nextNewKey = newKeys[newKeyIdx + 1];
        if (nextNewKey == null) {
            return null;
        } else if (oldKeyIdxMap[nextNewKey] == null) {
            return findNextOldKeyInNewKeys(newKeyIdx + 1);
        } else {
            return oldKeys[oldKeyIdxMap[nextNewKey]];
        }
    };

    newKeys.forEach((newKey, newIdx) => {
        const oldIdx = oldKeyIdxMap[newKey];
        if (oldIdx != null) {
            const oldPrevKey = oldKeys[oldIdx - 1],
                newPrevKey = newKeys[newIdx - 1];
            if (oldPrevKey !== newPrevKey) {
                diffs.push({
                    type: KEY_DIFF_TYPES.MOVE_KEY,
                    key: newKey,
                    next: findNextOldKeyInNewKeys(newIdx)
                });
            }
        } else {
            diffs.push({
                type: KEY_DIFF_TYPES.INSERT_KEY,
                key: newKey,
                next: findNextOldKeyInNewKeys(newIdx)
            });
        }
    });

    const newKeyMap = {};
    newKeys.forEach(newKey => newKeyMap[newKey] = true);
    oldKeys.forEach(oldKey => {
        if (!newKeyMap[oldKey]) {
            diffs.push({
                type: KEY_DIFF_TYPES.DELETE_KEY,
                key: oldKey
            });
        }
    });

    return diffs;
}
