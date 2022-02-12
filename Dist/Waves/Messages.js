import { NodeGroup } from "../Graph/NodeGroup.js";
export function XHasChildY(x, y) {
    if (!(x instanceof NodeGroup && y instanceof NodeGroup))
        return false;
    return x.path_parts.length == y.path_parts.length - 1 && y.path.startsWith(`${x.path}/`);
}
export class Message {
}
// messages that are generally more relevant for down-wave
// ==========
export class MyLCMounted extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyCHMounted extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyLCUnmounted extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyCHUnmounted extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyLCResized extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyCHRectChanged extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class IDetached extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
// messages that are generally more relevant for up-wave
// ==========
export class MyInnerUIRectChanged extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
export class MyLineTargetPointChanged extends Message {
    constructor(data) { super(); Object.assign(this, data); }
}
