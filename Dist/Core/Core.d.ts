import { FlexNode } from './FlexNode.js';
export type ChildrenFunc<Datum> = (data: Datum) => any;
export type NodeSizeFunc<Datum> = (self: FlexNode<Datum>) => any;
export type SpacingFunc<Datum> = (nodeA: FlexNode<Datum>, nodeB: FlexNode<Datum>) => any;
export declare class FlexTreeOptions<Datum> {
    static defaults: Readonly<{
        children: (data: any) => any;
        nodeSize: (node: any) => any;
        spacing: 0;
    }>;
    children: ChildrenFunc<Datum>;
    nodeSize: NodeSizeFunc<Datum>;
    spacing: SpacingFunc<Datum>;
}
export declare class FlexTreeLayout<Datum> {
    constructor(options?: Partial<FlexTreeOptions<Datum>>);
    opts: FlexTreeOptions<Datum>;
    accessor(name: string): any;
    receiveTree(tree: FlexNode<Datum>): FlexNode<Datum>;
    nodeSize(arg?: NodeSizeFunc<Datum>): this | NodeSizeFunc<Datum>;
    spacing(arg?: SpacingFunc<Datum>): this | SpacingFunc<Datum>;
    children(arg?: ChildrenFunc<Datum>): this | ChildrenFunc<Datum>;
    hierarchy(treeData: Datum, children?: ChildrenFunc<Datum>): FlexNode<Datum>;
    dump(tree: FlexNode): string;
}
