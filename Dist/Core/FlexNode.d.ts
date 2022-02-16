import { hierarchy } from "d3-hierarchy";
export declare class FlexNode extends hierarchy.prototype.constructor {
    constructor(data: any, nodeSize: (self: FlexNode) => any, spacing: (self: FlexNode, oNode: FlexNode) => any);
    func_nodeSize: (self: FlexNode) => any;
    func_spacing: (self: FlexNode, oNode: FlexNode) => any;
    copy(): any;
    get size(): any;
    spacing(oNode: any): any;
    get nodes(): any;
    get xSize(): any;
    get ySize(): any;
    get top(): any;
    get bottom(): any;
    get left(): number;
    get right(): any;
    get root(): any;
    get numChildren(): any;
    get hasChildren(): boolean;
    get noChildren(): boolean;
    get firstChild(): any;
    get lastChild(): any;
    get extents(): any;
    get nodeExtents(): {
        top: any;
        bottom: any;
        left: number;
        right: any;
    };
    static maxExtents(e0: any, e1: any): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
export declare class FlexNode_Wrapper extends FlexNode {
    constructor(data: any, nodeSize: (self: FlexNode) => any, spacing: (self: FlexNode, oNode: FlexNode) => any);
    get size(): any;
    spacing(oNode: FlexNode): any;
    get x(): any;
    set x(v: any);
    get y(): any;
    set y(v: any);
    update(): this;
}
