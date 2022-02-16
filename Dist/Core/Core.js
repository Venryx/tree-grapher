// based on: https://github.com/Klortho/d3-flextree
import { FlexNode, FlexNode_Wrapper } from './FlexNode.js';
export class FlexTreeOptions {
}
FlexTreeOptions.defaults = Object.freeze({
    children: data => data.children,
    nodeSize: node => node.data.size,
    spacing: 0,
});
// Create a layout function with customizable options. Per D3-style, the
// options can be set at any time using setter methods. The layout function
// will compute the tree node positions based on the options in effect at the
// time it is called.
export class FlexTreeLayout {
    constructor(options) {
        this.opts = Object.assign({}, FlexTreeOptions.defaults, options);
    }
    accessor(name) {
        const opt = this.opts[name];
        return typeof opt === 'function' ? opt : () => opt;
    }
    receiveTree(tree) {
        const wtree = this.wrap(FlexNode_Wrapper, tree, node => node.children);
        wtree.update();
        return wtree.data;
    }
    wrap(FlexClass, treeData, children) {
        const _wrap = (data, parent) => {
            const node = new FlexClass(data, this.accessor('nodeSize'), this.accessor('spacing'));
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
    nodeSize(arg) {
        return arguments.length ? (this.opts.nodeSize = arg, this) : this.opts.nodeSize;
    }
    spacing(arg) {
        return arguments.length ? (this.opts.spacing = arg, this) : this.opts.spacing;
    }
    children(arg) {
        return arguments.length ? (this.opts.children = arg, this) : this.opts.children;
    }
    hierarchy(treeData, children) {
        const kids = typeof children === 'undefined' ? this.opts.children : children;
        return this.wrap(FlexNode, treeData, kids);
    }
    dump(tree) {
        const nodeSize = this.accessor('nodeSize');
        const _dump = i0 => node => {
            const i1 = i0 + '  ';
            const i2 = i0 + '    ';
            const { x, y } = node;
            const size = nodeSize(node);
            const kids = (node.children || []);
            const kdumps = (kids.length === 0) ? ' ' :
                `,${i1}children: [${i2}${kids.map(_dump(i2)).join(i2)}${i1}],${i0}`;
            return `{ size: [${size.join(', ')}],${i1}x: ${x}, y: ${y}${kdumps}},`;
        };
        return _dump('\n')(tree);
    }
}
