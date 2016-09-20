import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as DiffTypes from '../src/diff-types';
import vdom, {updateNode, findDiff, applyDiff} from '../src/index';

chai.Should();
chai.use(chaiAsPromised);
const assert = chai.assert;

const testDom = document.querySelector('#test');

function resetTest() {
    testDom.innerHTML = '';
}

describe('Test Virtual DOM', function () {
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
});
