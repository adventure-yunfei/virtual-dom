import forEach from 'lodash/forEach';

class DiffType {
    constructor(vdomNode, containerDOM, realDOM) {
        this.vdomNode = vdomNode;
        this.containerDOM = containerDOM;
        this.realDOM = realDOM;
    }

    apply() {
        throw new Error('Not implemented!');
    }
}

export class RemoveNodeDiff extends DiffType {
    apply() {
        this.containerDOM.removeChild(this.realDOM);
    }
}

export class InsertNodeDiff extends DiffType {
    apply() {
        this.containerDOM.appendChild(this.vdomNode.createDOM());
    }
}

export class ReplaceNodeDiff extends DiffType {
    apply() {
        this.containerDOM.replaceChild(this.vdomNode.createDOM(), this.realDOM);
    }
}

export class RemoveAttributeDiff extends DiffType {
    constructor(vdomNode, containerDOM, realDOM, removedAttributeKeys = []) {
        super(...arguments);
        this.removedAttributeKeys = removedAttributeKeys;
    }
    apply() {
        this.removedAttributeKeys.forEach(key => {
            this.realDOM.removeAttribute(key);
        });
    }
}

export class SetAttributeDiff extends DiffType {
    constructor(vdomNode, containerDOM, realDOM, attributes = {}) {
        super(...arguments);
        this.attributes = attributes;
    }
    apply() {
        forEach(this.attributes, (val, key) => {
            this.realDOM.setAttribute(key, val);
        });
    }
}
