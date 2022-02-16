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
    receiveTree(tree: any): any;
    getFlexNode(): {
        new (data: any): {
            [x: string]: any;
            copy(): any;
            readonly size: any;
            spacing(oNode: any): any;
            readonly nodes: any;
            readonly xSize: any;
            readonly ySize: any;
            readonly top: any;
            readonly bottom: any;
            readonly left: number;
            readonly right: any;
            readonly root: any;
            readonly numChildren: any;
            readonly hasChildren: boolean;
            readonly noChildren: boolean;
            readonly firstChild: any;
            readonly lastChild: any;
            readonly extents: any;
            readonly nodeExtents: {
                top: any;
                bottom: any;
                left: number;
                right: any;
            };
        };
        [x: string]: any;
        maxExtents(e0: any, e1: any): {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
    getWrapper(): {
        new (data: any): {
            [x: string]: any;
            readonly size: any;
            spacing(oNode: any): any;
            x: any;
            y: any;
            update(): any;
            copy(): any;
            readonly nodes: any;
            readonly xSize: any;
            readonly ySize: any;
            readonly top: any;
            readonly bottom: any;
            readonly left: number;
            readonly right: any;
            readonly root: any;
            readonly numChildren: any;
            readonly hasChildren: boolean;
            readonly noChildren: boolean;
            readonly firstChild: any;
            readonly lastChild: any;
            readonly extents: any;
            readonly nodeExtents: {
                top: any;
                bottom: any;
                left: number;
                right: any;
            };
        };
        maxExtents(e0: any, e1: any): {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
    wrap(FlexClass: any, treeData: any, children: any): any;
    nodeSize(arg: any): any;
    spacing(arg: any): any;
    children(arg: any): any;
    hierarchy(treeData: any, children?: any): any;
    dump(tree: any): string;
}
