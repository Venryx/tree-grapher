import { FlexNode } from './FlexNode.js';
export declare type ChildrenFunc = (data: any) => any;
export declare type NodeSizeFunc = (self: FlexNode) => any;
export declare type SpacingFunc = (nodeA: FlexNode, nodeB: FlexNode) => any;
export declare class FlexTreeOptions {
    static defaults: Readonly<{
        children: (data: any) => any;
        nodeSize: (node: any) => any;
        spacing: number;
    }>;
    children: ChildrenFunc;
    nodeSize: NodeSizeFunc;
    spacing: SpacingFunc;
}
export declare class FlexTreeLayout {
    constructor(options?: Partial<FlexTreeOptions>);
    opts: FlexTreeOptions;
    accessor(name: string): any;
    receiveTree<Datum>(tree: FlexNode<Datum>): FlexNode<Datum>;
    nodeSize(arg?: NodeSizeFunc): NodeSizeFunc | this;
    spacing(arg?: SpacingFunc): SpacingFunc | this;
    children(arg?: ChildrenFunc): this | ChildrenFunc;
    hierarchy<Datum>(treeData: Datum, children?: any): FlexNode<Datum>;
    dump(tree: FlexNode): string;
}
