import forEach from 'lodash/forEach';

class DiffType {
    constructor(containerDOM, realDOM) {
        this.containerDOM = containerDOM;
        this.realDOM = realDOM;
    }

    apply() {
        throw new Error('Not implemented!');
    }
}

export class RemoveNodeDiff extends DiffType {
    constructor(containerDOM, realDOM) {
        super(containerDOM, realDOM);
    }
    apply() {
        this.containerDOM.removeChild(this.realDOM);
    }
}

export class InsertNodeDiff extends DiffType {
    constructor(containerDOM, realDOM, nextDOM, vdomNode) {
        super(containerDOM, null);
        this.nextDOM = nextDOM;
        this.vdomNode = vdomNode;
    }
    apply() {
        this.containerDOM.insertBefore(this.vdomNode.createDOM(), this.nextDOM);
    }
}

export class MoveNodeDiff extends DiffType {
    constructor(containerDOM, realDOM, nextDOM) {
        super(containerDOM, realDOM);
        this.nextDOM = nextDOM;
    }
    apply() {
        this.containerDOM.insertBefore(this.realDOM, this.nextDOM);
    }
}

export class ReplaceNodeDiff extends DiffType {
    constructor(containerDOM, realDOM, vdomNode) {
        super(containerDOM, realDOM);
        this.vdomNode = vdomNode;
    }
    apply() {
        this.containerDOM.replaceChild(this.vdomNode.createDOM(), this.realDOM);
    }
}

export class RemoveAttributeDiff extends DiffType {
    constructor(containerDOM, realDOM, removedAttributeKeys = []) {
        super(null, realDOM);
        this.removedAttributeKeys = removedAttributeKeys;
    }
    apply() {
        this.removedAttributeKeys.forEach(key => {
            this.realDOM.removeAttribute(key);
        });
    }
}

export class SetAttributeDiff extends DiffType {
    constructor(containerDOM, realDOM, attributes = {}) {
        super(null, realDOM);
        this.attributes = attributes;
    }
    apply() {
        forEach(this.attributes, (val, key) => {
            this.realDOM.setAttribute(key, val);
        });
    }
}
