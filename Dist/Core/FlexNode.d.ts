import { HierarchyPointNode } from "d3-hierarchy";
import { NodeSizeFunc, SpacingFunc } from "./Core.js";
declare const FlexNode_base: new (..._: any[]) => HierarchyPointNode<any>;
export declare class FlexNode<Datum = any> extends FlexNode_base {
    constructor(data: Datum, nodeSize: NodeSizeFunc<Datum>, spacing: SpacingFunc<Datum>);
    func_nodeSize: NodeSizeFunc<Datum>;
    func_spacing: SpacingFunc<Datum>;
    data: Datum;
    /** Only set if wrapFlexNode is used for this node. */
    length: number;
    copy(): this;
    get size(): any;
    spacing(oNode: any): any;
    get nodes(): this[];
    get xSize(): any;
    get ySize(): any;
    get top(): number;
    get bottom(): any;
    get left(): number;
    get right(): number;
    get root(): this;
    get numChildren(): number;
    get hasChildren(): boolean;
    get noChildren(): boolean;
    get firstChild(): this | null;
    get lastChild(): this | null;
    get extents(): {
        top: number;
        bottom: any;
        left: number;
        right: number;
    };
    get nodeExtents(): {
        top: number;
        bottom: any;
        left: number;
        right: number;
    };
    static maxExtents(e0: any, e1: any): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
export declare function wrapFlexNode<T extends FlexNode, Datum = any>(FlexClass: new (..._: any[]) => T, treeData: Datum, children: any, nodeSize: NodeSizeFunc<Datum>, spacing: SpacingFunc<Datum>): T;
export declare class FlexNode_Wrapper<Datum extends FlexNode = FlexNode<any>> extends FlexNode<Datum> {
    constructor(data: any, nodeSize: (self: FlexNode) => any, spacing: (self: FlexNode, oNode: FlexNode) => any);
    get size(): any;
    spacing(oNode: FlexNode): any;
    get x(): number;
    set x(v: number);
    get y(): number;
    set y(v: number);
    relX: number;
    prelim: number;
    shift: number;
    change: number;
    lExt: FlexNode_Wrapper<Datum>;
    lExtRelX: number;
    lThr: any;
    rExt: FlexNode_Wrapper<Datum>;
    rExtRelX: number;
    rThr: any;
    update(): this;
}
export {};
