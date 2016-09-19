import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {h, updateNode} from '../src/index';

chai.Should();
chai.use(chaiAsPromised);
const assert = chai.assert;

const testDom = document.querySelector('#test');

function resetTest() {
    testDom.innerHTML = '';
}

function timeout(interval = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, interval);
    });
}

describe('Test Virtual DOM', function () {
    it('Test Null', function () {
        resetTest();
        updateNode(testDom, null, null);
        assert.equal(testDom.innerHTML, '');
    });

    it('Test Initial Create', function () {
        resetTest();
        updateNode(testDom, null, h('span'));
        assert.equal(testDom.innerHTML, '<span></span>');

        resetTest();
        updateNode(testDom, null, h('span', {a: '1'}, 'ccc'));
        assert.equal(testDom.innerHTML, '<span a="1">ccc</span>');

        resetTest();
        updateNode(
            testDom,
            null,
            h('span', {a: '1'}, [
                'ccc',
                h('a', {src: 'test.src'}),
                'ddd',
                h('div', {}, [
                    h('i'),
                    'eee'
                ])
            ])
        );
        assert.equal(testDom.innerHTML, '<span a="1">ccc<a src="test.src"></a>ddd<div><i></i>eee</div></span>');
    });

    it('Test Update VDom', function () {
        resetTest();
        const vdomTree = h('span', {a: '1'}, 'ccc'),
            vdomTree_updateAttr = h('span', {a: '2'}, 'ccc'),
            vdomTree_updateChild = h('span', {a: '2'}, 'cccd'),
            vdomTree_updateChild2 = h('span', {a: '2'}, ['ddd', h('div', {c: '2'}, 'e')]),
            anotherVdomTree = h('span', {a: '1'}, [
                'ccc',
                h('a', {src: 'test.src'}),
                'ddd',
                h('div', {}, [
                    h('i'),
                    'eee'
                ])
            ]);

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

    it('Test Update with Same Node: Simple VDOM', function () {
        let _reject = null;
        const forbiddenObserver = new MutationObserver(() => _reject('错误的DOM更新')),
            startObserve = () => forbiddenObserver.observe(testDom, {childList: true, attributes: true, subtree: true});
        return Promise.race([
            new Promise((resolve, reject) => {
                _reject = reject;
                resetTest();
                const simpleVDomTree = h('span', {a: '1'}, 'ccc');
                updateNode(testDom, null, simpleVDomTree);
                startObserve();
                updateNode(testDom, simpleVDomTree, simpleVDomTree);
            }),

            timeout(300)
        ]).finally(() => forbiddenObserver.disconnect());
    });

    it('Test Update with Same Node: Complex VDOM', function () {
        let _reject = null;
        const forbiddenObserver = new MutationObserver(() => _reject('错误的DOM更新')),
            startObserve = () => forbiddenObserver.observe(testDom, {childList: true, attributes: true, subtree: true});
        return Promise.race([
            new Promise((resolve, reject) => {
                _reject = reject;
                resetTest();
                const complexVDomTree = h('span', {a: '1'}, [
                    'ccc',
                    h('a', {src: 'test.src'}),
                    'ddd',
                    h('div', {}, [
                        h('i'),
                        'eee'
                    ])
                ]);
                updateNode(testDom, null, complexVDomTree);
                startObserve();
                updateNode(testDom, complexVDomTree, complexVDomTree);
            }),

            timeout(300)
        ]).finally(() => forbiddenObserver.disconnect());
    });
});