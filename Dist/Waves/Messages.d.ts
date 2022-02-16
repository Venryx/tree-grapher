import { Vector2, VRect } from "js-vextensions";
import { NodeGroup } from "../Graph/NodeGroup.js";
import { n } from "../Utils/@Internal/Types.js";
export declare function XHasChildY(x: NodeGroup, y: NodeGroup): boolean;
export declare class Message {
    constructor(showOnLC?: boolean);
    Populate?(data: any): void;
    me: NodeGroup;
    me_path?: string;
    sender_extra?: string;
    showOnLC?: boolean;
    toString(): string;
}
export declare class MyLCMounted extends Message {
    constructor(data: MyLCMounted);
}
export declare class MyCHMounted extends Message {
    constructor(data: MyLCMounted);
}
export declare class MyLCUnmounted extends Message {
    constructor(data: MyLCMounted);
}
export declare class MyCHUnmounted extends Message {
    constructor(data: MyLCMounted);
}
export declare class MyLCResized extends Message {
    constructor(data: MyLCResized);
    newSize: Vector2;
}
export declare class MyLCRectChanged extends Message {
    constructor(data: MyLCRectChanged);
    oldRect: VRect | n;
    newRect: VRect | n;
}
export declare class MyLCAlignChanged extends Message {
    constructor(data: MyLCAlignChanged);
    oldVal: number | n;
    newVal: number | n;
}
export declare class MyCHResized extends Message {
    constructor(data: MyCHResized);
    newSize: Vector2;
}
export declare class MyPrevGroupRectBottomChanged extends Message {
    constructor(data: MyPrevGroupRectBottomChanged);
}
export declare class MyCHShiftChanged extends Message {
    constructor(data: MyCHShiftChanged);
    oldVal: number | n;
    newVal: number | n;
}
export declare class MyCHRectChanged extends Message {
    constructor(data: MyCHRectChanged);
    oldRect: VRect | n;
    newRect: VRect | n;
}
export declare class IDetached extends Message {
    constructor(data: IDetached);
}
export declare class MyInnerUIRectChanged extends Message {
    constructor(data: MyInnerUIRectChanged);
    oldRect: VRect | n;
    newRect: VRect | n;
}
export declare class MyLineSourcePointChanged extends Message {
    constructor(data: MyLineSourcePointChanged);
    oldVal: number | n;
    newVal: number | n;
}
