export function XHasChildY(x, y) {
    return x.path_parts.length == y.path_parts.length - 1 && y.path.startsWith(`${x.path}/`);
}
export class Message {
    //constructor(data: Message) { Object.assign(this, data); }
    constructor(showOnLC) {
        this.showOnLC = showOnLC;
    }
    Populate(data) {
        Object.assign(this, data);
        this.me_path = this.me.path; //+ (this.sender_extra ? ` [${this.sender_extra}]` : "");
    }
    toString() {
        const result = { ...this };
        //result.sender = CE(result.sender).ExcludeKeys("graph", "columnsPartOf", "leftColumnEl", "childHolderEl", "connectorLinesComp") as any;
        //result.sender = result.sender.path as any;
        delete result.me;
        delete result.me_path;
        delete result.sender_extra;
        return this.constructor.name + ":" + JSON.stringify(result);
    }
}
// messages that are generally more relevant for down-wave
// ==========
export class MyLCMounted extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyCHMounted extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class MyLCUnmounted extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyCHUnmounted extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class MyLCResized extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyLCRectChanged extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyLCAlignChanged extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyCHResized extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class MyPrevGroupRectBottomChanged extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class MyCHShiftChanged extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class MyCHRectChanged extends Message {
    constructor(data) { super(); this.Populate(data); }
}
export class IDetached extends Message {
    constructor(data) { super(); this.Populate(data); }
}
// messages that are generally more relevant for up-wave
// ==========
export class MyInnerUIRectChanged extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
export class MyLineSourcePointChanged extends Message {
    constructor(data) { super(true); this.Populate(data); }
}
