// based on: https://github.com/Klortho/d3-flextree
import { FlexNode, FlexNode_Wrapper, wrapFlexNode } from './FlexNode.js';
export class FlexTreeOptions {
    static defaults = Object.freeze({
        children: data => data.children,
        nodeSize: node => node.data.size,
        spacing: 0,
    });
    children;
    nodeSize;
    spacing;
}
// Create a layout function with customizable options. Per D3-style, the options can be set at any time using setter methods.
// The layout function will compute the tree node positions based on the options in effect at the time it is called.
export class FlexTreeLayout {
    constructor(options) {
        this.opts = Object.assign({}, FlexTreeOptions.defaults, options);
    }
    opts;
    accessor(name) {
        const opt = this.opts[name];
        return typeof opt === 'function' ? opt : () => opt;
    }
    receiveTree(tree) {
        const wtree = wrapFlexNode(FlexNode_Wrapper, tree, node => node.children, this.accessor('nodeSize'), this.accessor('spacing'));
        wtree.update();
        return wtree.data;
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
        return wrapFlexNode(FlexNode, treeData, kids, this.accessor('nodeSize'), this.accessor('spacing'));
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
