import { hierarchy } from "d3-hierarchy";
import { layoutChildren, resolveX } from "./Utils.js";
export class FlexNode extends hierarchy.prototype.constructor {
    constructor(data, nodeSize, spacing) {
        super(data);
        this.func_nodeSize = nodeSize;
        this.func_spacing = spacing;
    }
    func_nodeSize;
    func_spacing;
    /** Only set if wrapFlexNode is used for this node. */
    length;
    copy() {
        /*const self = this;
        // [Is this actually correct? Seems that `this.data` should be passed instead of `this`...]
        const c = wrapFlexNode<FlexNode_Wrapper<typeof self>, typeof self>(this.constructor as any, this, node=>node.children, this.func_nodeSize, this.func_spacing);
        c.each(node=>node.data = (node.data as any).data);
        return c;*/
        return new FlexNode(this.data, this.func_nodeSize, this.func_spacing);
    }
    get size() { return this.func_nodeSize(this); }
    spacing(oNode) { return this.func_spacing(this, oNode); }
    get nodes() { return this.descendants(); }
    get xSize() { return this.size[0]; }
    get ySize() { return this.size[1]; }
    get top() { return this.y; }
    get bottom() { return this.y + this.ySize; }
    get left() { return this.x - this.xSize / 2; }
    get right() { return this.x + this.xSize / 2; }
    get root() {
        const ancs = this.ancestors();
        return ancs[ancs.length - 1];
    }
    get numChildren() {
        return this.hasChildren ? this.children.length : 0;
    }
    get hasChildren() { return !this.noChildren; }
    get noChildren() { return this.children === null; }
    get firstChild() {
        return this.hasChildren ? this.children[0] : null;
    }
    get lastChild() {
        return this.hasChildren ? this.children[this.numChildren - 1] : null;
    }
    get extents() {
        return (this.children || []).reduce((acc, kid) => FlexNode.maxExtents(acc, kid.extents), this.nodeExtents);
    }
    get nodeExtents() {
        return {
            top: this.top,
            bottom: this.bottom,
            left: this.left,
            right: this.right,
        };
    }
    static maxExtents(e0, e1) {
        return {
            top: Math.min(e0.top, e1.top),
            bottom: Math.max(e0.bottom, e1.bottom),
            left: Math.min(e0.left, e1.left),
            right: Math.max(e0.right, e1.right),
        };
    }
}
;
export function wrapFlexNode(FlexClass, treeData, children, nodeSize, spacing) {
    const _wrap = (data, parent) => {
        const node = new FlexClass(data, nodeSize, spacing);
        Object.assign(node, {
            parent,
            depth: parent === null ? 0 : parent.depth + 1,
            height: 0,
            length: 1,
        });
        const kidsData = children(data) || [];
        node.children = kidsData.length === 0 ? null
            : kidsData.map(kd => _wrap(kd, node));
        if (node.children) {
            Object.assign(node, node.children.reduce((hl, kid) => ({
                height: Math.max(hl.height, kid.height + 1),
                length: hl.length + kid.length,
            }), node));
        }
        return node;
    };
    return _wrap(treeData, null);
}
export class FlexNode_Wrapper extends FlexNode {
    constructor(data, nodeSize, spacing) {
        super(data, nodeSize, spacing);
        Object.assign(this, {
            x: 0, y: 0,
            relX: 0, prelim: 0, shift: 0, change: 0,
            lExt: this, lExtRelX: 0, lThr: null,
            rExt: this, rExtRelX: 0, rThr: null,
        });
    }
    // proxies to 
    get size() { return this.func_nodeSize(this.data); }
    spacing(oNode) { return this.func_spacing(this.data, oNode.data); }
    get x() { return this.data.x; }
    set x(v) {
        if (isNaN(v))
            throw new Error("Encountered NaN when setting FlexNode_Wrapper.x!");
        this.data.x = v;
    }
    get y() { return this.data.y; }
    set y(v) {
        if (isNaN(v))
            throw new Error("Encountered NaN when setting FlexNode_Wrapper.y!");
        this.data.y = v;
    }
    // wrapper-added fields
    relX;
    prelim;
    shift;
    change;
    lExt;
    lExtRelX;
    lThr;
    rExt;
    rExtRelX;
    rThr;
    update() {
        layoutChildren(this);
        resolveX(this);
        return this;
    }
}
