// based on: https://github.com/Klortho/d3-flextree

import {FlexNode, FlexNode_Wrapper, wrapFlexNode} from './FlexNode.js';

export type ChildrenFunc = (data: any)=>any;
export type NodeSizeFunc<Datum> = (self: FlexNode<Datum>)=>any;
export type SpacingFunc<Datum> = (nodeA: FlexNode<Datum>, nodeB: FlexNode<Datum>)=>any;
export class FlexTreeOptions<Datum> {
	static defaults = Object.freeze({
		children: data => data.children,
		nodeSize: node => node.data.size,
		spacing: 0,
	});

	children: ChildrenFunc;
	nodeSize: NodeSizeFunc<Datum>;
	spacing: SpacingFunc<Datum>;
}

// Create a layout function with customizable options. Per D3-style, the options can be set at any time using setter methods.
// The layout function will compute the tree node positions based on the options in effect at the time it is called.
export class FlexTreeLayout<Datum> {
	constructor(options?: Partial<FlexTreeOptions<Datum>>) {
		this.opts = Object.assign({}, FlexTreeOptions.defaults, options);
	}
	opts: FlexTreeOptions<Datum>;

	accessor(name: string) {
		const opt = this.opts[name];
		return typeof opt === 'function' ? opt : () => opt;
	}

	receiveTree<Datum>(tree: FlexNode<Datum>) {
		const wtree = wrapFlexNode<FlexNode_Wrapper<FlexNode<Datum>>, FlexNode<Datum>>(FlexNode_Wrapper, tree, node=>node.children, this.accessor('nodeSize'), this.accessor('spacing'));
		wtree.update();
		return wtree.data;
	}
	
	nodeSize(arg?: NodeSizeFunc<Datum>) {
		return arguments.length ? (this.opts.nodeSize = arg!, this) : this.opts.nodeSize;
	}
	spacing(arg?: SpacingFunc<Datum>) {
		return arguments.length ? (this.opts.spacing = arg!, this) : this.opts.spacing;
	}
	children(arg?: ChildrenFunc) {
		return arguments.length ? (this.opts.children = arg!, this) : this.opts.children;
	}
	hierarchy<Datum>(treeData: Datum, children?) {
		const kids = typeof children === 'undefined' ? this.opts.children : children;
		return wrapFlexNode<FlexNode<Datum>, Datum>(FlexNode, treeData, kids, this.accessor('nodeSize'), this.accessor('spacing'));
	}
	dump(tree: FlexNode) {
		const nodeSize = this.accessor('nodeSize');
		const _dump = i0 => node => {
			const i1 = i0 + '  ';
			const i2 = i0 + '    ';
			const {x, y} = node;
			const size = nodeSize(node);
			const kids = (node.children || []);
			const kdumps = (kids.length === 0) ? ' ' :
				`,${i1}children: [${i2}${kids.map(_dump(i2)).join(i2)}${i1}],${i0}`;
			return `{ size: [${size.join(', ')}],${i1}x: ${x}, y: ${y}${kdumps}},`;
		};
		return _dump('\n')(tree);
	}
}