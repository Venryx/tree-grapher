import { NodeGroup } from "../Graph/NodeGroup.js";
export declare type Sender = NodeGroup | "LCResizeObs" | "CHResizeObs";
export declare function XHasChildY(x: Sender, y: Sender): boolean;
export declare class Message {
    sender: Sender;
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
}
export declare class MyCHRectChanged extends Message {
    constructor(data: MyCHRectChanged);
}
export declare class IDetached extends Message {
    constructor(data: IDetached);
}
export declare class MyInnerUIRectChanged extends Message {
    constructor(data: MyInnerUIRectChanged);
}
export declare class MyLineTargetPointChanged extends Message {
    constructor(data: MyLineTargetPointChanged);
}
