import {CE, Vector2, VRect} from "js-vextensions";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {n} from "../Utils/@Internal/Types.js";

export function XHasChildY(x: NodeGroup, y: NodeGroup) {
	return x.path_parts.length == y.path_parts.length - 1 && y.path.startsWith(`${x.path}/`);
}

export class Message {
	//constructor(data: Message) { Object.assign(this, data); }
	constructor(showOnLC?: boolean) {
		this.showOnLC = showOnLC;
	}
	Populate?(data: any) {
		Object.assign(this, data);
		this.me_path = this.me.path; //+ (this.sender_extra ? ` [${this.sender_extra}]` : "");
	}
	me: NodeGroup;
	me_path?: string;
	sender_extra?: string;
	showOnLC?: boolean;
	
	toString() {
		const result = {...this} as Partial<Message>;
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
	constructor(data: MyLCMounted) { super(true); this.Populate!(data); }
}
export class MyCHMounted extends Message {
	constructor(data: MyLCMounted) { super(); this.Populate!(data); }
}
export class MyLCUnmounted extends Message {
	constructor(data: MyLCMounted) { super(true); this.Populate!(data); }
}
export class MyCHUnmounted extends Message {
	constructor(data: MyLCMounted) { super(); this.Populate!(data); }
}

export class MyLCResized extends Message {
	constructor(data: MyLCResized) { super(true); this.Populate!(data); }
	newSize: Vector2;
}
export class MyLCRectChanged extends Message {
	constructor(data: MyLCRectChanged) { super(true); this.Populate!(data); }
	oldRect: VRect|n;
	newRect: VRect|n;
}

export class MyLCAlignChanged extends Message {
	constructor(data: MyLCAlignChanged) { super(true); this.Populate!(data); }
	oldVal: number|n;
	newVal: number|n;
}

export class MyCHResized extends Message {
	constructor(data: MyCHResized) { super(); this.Populate!(data); }
	newSize: Vector2;
}
export class MyPrevGroupRectBottomChanged extends Message {
	constructor(data: MyPrevGroupRectBottomChanged) { super(); this.Populate!(data); }
}
export class MyCHShiftChanged extends Message {
	constructor(data: MyCHShiftChanged) { super(); this.Populate!(data); }
	oldVal: number|n;
	newVal: number|n;
}
export class MyCHRectChanged extends Message {
	constructor(data: MyCHRectChanged) { super(); this.Populate!(data); }
	oldRect: VRect|n;
	newRect: VRect|n;
	echoesSentTo: string[];
}

export class IDetached extends Message {
	constructor(data: IDetached) { super(); this.Populate!(data); }
}

// messages that are generally more relevant for up-wave
// ==========

export class MyInnerUIRectChanged extends Message {
	constructor(data: MyInnerUIRectChanged) { super(true); this.Populate!(data); }
	oldRect: VRect|n;
	newRect: VRect|n;
}

export class MyLineSourcePointChanged extends Message {
	constructor(data: MyLineSourcePointChanged) { super(true); this.Populate!(data); }
	oldVal: number|n;
	newVal: number|n;
}