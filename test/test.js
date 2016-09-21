import chai from 'chai';
import random from 'lodash/random';
import range from 'lodash/range';
import chaiAsPromised from 'chai-as-promised';
import * as DiffTypes from '../src/diff-types';
import findKeysDiff, {testDiffs as testKeysDiff} from '../src/find-keys-diff';
import vdom, {updateNode, findDiff, applyDiff} from '../src/index';

chai.Should();
chai.use(chaiAsPromised);
const assert = chai.assert;

const testDom = document.querySelector('#test');

function resetTest() {
    testDom.innerHTML = '';
}

describe('Test Key Diffs', function () {
    function findAndTestDiff(oldKeys, newKeys) {
        const keyDiffs = findKeysDiff(oldKeys, newKeys);
        assert(testKeysDiff(oldKeys, newKeys, keyDiffs), `Key diff not matching. keys: ${JSON.stringify(oldKeys)}, ${JSON.stringify(newKeys)}`);
    }
    function genRandomKeys(size) {
        const keysMap = {},
            keys = [];
        while (keys.length < size) {
            const candidateKey = random(size * 10).toString();
            if (!keysMap[candidateKey]) {
                keys.push(candidateKey);
                keysMap[candidateKey] = true;
            }
        }
        return keys;
    }

    it('Test Key Diffs', function () {
        findAndTestDiff(['a', 'b', 'c', 'd'], ['a', 'd', 'b', 'c']);
        findAndTestDiff(['a', 'b', 'c', 'd'], ['a', 'd', 'c']);

        findAndTestDiff(["9","11","8","36","1"], ["33","8","0","9","23"]);
    });

    it('Completely Random Test Key Diffs', function () {
        for (let i = 0; i < 100; i++) {
            findAndTestDiff(genRandomKeys(random(5)), genRandomKeys(5));
            findAndTestDiff(genRandomKeys(random(20)), genRandomKeys(20));
            findAndTestDiff(genRandomKeys(random(200)), genRandomKeys(200));
        }
    });
});

describe('Test Virtual DOM', function () {
    const alphabet = range(26).map(idx => String.fromCharCode('a'.charCodeAt(0)));
    const availableVDOMTypes = ['div', 'span', 'a', 'button', 'p', 'h'];
    const _randomType = () => availableVDOMTypes[random(availableVDOMTypes.length - 1)],
        _randomAlphabet = () => alphabet[random(alphabet.length - 1)];
    function genRandomVDOM(nodeSize, maxAttrSize = 5, maxChildSize = 10) {
        nodeSize = nodeSize - 1;
        const randomAttrs = range(random(maxAttrSize)).reduce((result) => {
                result[_randomAlphabet()] = _randomAlphabet();
                return result;
            }, {}),
            childSize = nodeSize === 0 ? 0 : random(1, Math.min(nodeSize, maxChildSize));
        nodeSize = nodeSize - childSize;
        const childSubnodeSizes = range(childSize).map((val, idx) => {
            let subnodeSize = Math.min(Math.round(random(nodeSize) / childSize), nodeSize);
            if (idx === childSize - 1) {
                subnodeSize = nodeSize;
            }
            nodeSize = nodeSize - subnodeSize;

            return subnodeSize;
        });

        return vdom.createVDOMNode(
            _randomType(),
            randomAttrs,
            ...childSubnodeSizes.map(subnodeSize => {
                return genRandomVDOM(subnodeSize + 1, maxAttrSize, maxChildSize);
            })
        );
    }

    it('Test Null', function () {
        resetTest();
        updateNode(testDom, null, null);
        const diffs = findDiff(testDom, null, null);
        applyDiff(diffs);
        assert.equal(diffs.length, 0);
        assert.equal(testDom.innerHTML, '');
    });

    it('Test Initial Create', function () {
        resetTest();
        const diffs = findDiff(testDom, null, <span/>);
        applyDiff(diffs);
        assert.equal(diffs.length, 1);
        assert(diffs[0] instanceof DiffTypes.InsertNodeDiff, 'Unexpected diff types');
        assert.equal(testDom.innerHTML, '<span></span>');

        resetTest();
        updateNode(testDom, null, <span a="1">ccc</span>);
        assert.equal(testDom.innerHTML, '<span a="1">ccc</span>');

        resetTest();
        updateNode(testDom, null, (
            <span a="1">
                ccc
                <a src="test.src"/>
                ddd
                <div><i/>eee</div>
            </span>
        ));
        assert.equal(testDom.innerHTML, '<span a="1">ccc<a src="test.src"></a>ddd<div><i></i>eee</div></span>');
    });

    it('Test Update VDom', function () {
        resetTest();
        const vdomTree = <span a="1">ccc</span>,
            vdomTree_updateAttr = <span a="2">ccc</span>,
            vdomTree_updateChild = <span a="2">cccd</span>,
            vdomTree_updateChild2 = <span a="2">ddd<div c="2">e</div></span>,
            anotherVdomTree = (
                <span a="1">
                    ccc
                    <a src="test.src"/>
                    ddd
                    <div><i/>eee</div>
                </span>
            );

        updateNode(testDom, null, vdomTree);
        updateNode(testDom, vdomTree, vdomTree_updateAttr);
        assert.equal(testDom.innerHTML, '<span a="2">ccc</span>');

        updateNode(testDom, vdomTree_updateAttr, vdomTree_updateChild);
        assert.equal(testDom.innerHTML, '<span a="2">cccd</span>');

        updateNode(testDom, vdomTree_updateChild, vdomTree_updateChild2);
        assert.equal(testDom.innerHTML, '<span a="2">ddd<div c="2">e</div></span>');        

        updateNode(testDom, vdomTree_updateChild2, anotherVdomTree);
        assert.equal(testDom.innerHTML, '<span a="1">ccc<a src="test.src"></a>ddd<div><i></i>eee</div></span>');
    });

    it('Test Update with Same VDOM', function () {
        const simpleVDomTree = <span a="1">ccc</span>,
            complexVDomTree = (
                <span a="1">
                    ccc
                    <a src="test.src"/>
                    ddd
                    <div><i/>eee</div>
                </span>
            );

        resetTest();
        updateNode(testDom, null, simpleVDomTree);
        let diffs = findDiff(testDom, simpleVDomTree, simpleVDomTree);
        assert.equal(diffs.length, 0);

        resetTest();
        updateNode(testDom, null, complexVDomTree);
        diffs = findDiff(testDom, complexVDomTree, complexVDomTree);
        assert.equal(diffs.length, 0);
    });

    const randomVNode = genRandomVDOM(100000);
    it('Before Test with Random VDOM: Prepare Real DOM...', function () {
        resetTest();
        updateNode(testDom, null, randomVNode);
    });
    it('Test with Random VDOM', function () {
        let diffs = findDiff(testDom, randomVNode, randomVNode);
        assert.equal(diffs.length, 0);
    });
});
