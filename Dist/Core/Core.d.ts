import { FlexNode } from './FlexNode.js';
export declare type ChildrenFunc = (data: any) => any;
export declare type NodeSizeFunc<Datum> = (self: FlexNode<Datum>) => any;
export declare type SpacingFunc<Datum> = (nodeA: FlexNode<Datum>, nodeB: FlexNode<Datum>) => any;
export declare class FlexTreeOptions<Datum> {
    static defaults: Readonly<{
        children: (data: any) => any;
        nodeSize: (node: any) => any;
        spacing: number;
    }>;
    children: ChildrenFunc;
    nodeSize: NodeSizeFunc<Datum>;
    spacing: SpacingFunc<Datum>;
}
export declare class FlexTreeLayout<Datum> {
    constructor(options?: Partial<FlexTreeOptions<Datum>>);
    opts: FlexTreeOptions<Datum>;
    accessor(name: string): any;
    receiveTree<Datum>(tree: FlexNode<Datum>): FlexNode<Datum>;
    nodeSize(arg?: NodeSizeFunc<Datum>): this | NodeSizeFunc<Datum>;
    spacing(arg?: SpacingFunc<Datum>): this | SpacingFunc<Datum>;
    children(arg?: ChildrenFunc): this | ChildrenFunc;
    hierarchy<Datum>(treeData: Datum, children?: any): FlexNode<Datum>;
    dump(tree: FlexNode): string;
}
