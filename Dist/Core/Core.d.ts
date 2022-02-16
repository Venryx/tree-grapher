import { FlexNode } from './FlexNode.js';
export declare class FlexTreeOptions {
    static defaults: Readonly<{
        children: (data: any) => any;
        nodeSize: (node: any) => any;
        spacing: number;
    }>;
    children: any;
    nodeSize: any;
    spacing: any;
}
export declare class FlexTreeLayout {
    constructor(options?: Partial<FlexTreeOptions>);
    opts: FlexTreeOptions;
    accessor(name: string): any;
    receiveTree(tree: FlexNode): any;
    wrap(FlexClass: typeof FlexNode, treeData: any, children: any): FlexNode;
    nodeSize(arg?: any): any;
    spacing(arg?: any): any;
    children(arg?: any): any;
    hierarchy(treeData: any, children?: any): FlexNode;
    dump(tree: any): string;
}
