import {Vector2, VRect} from "js-vextensions";
import {Graph} from "../Graph.js";
import {NodeConnectorOpts} from "../UI/ConnectorLinesUI.js";
import {n, RequiredBy} from "../Utils/@Internal/Types.js";

/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath: string) {
	const parts = treePath.split("/");
	//const maxPartLength = CE(parts.map(a=>a.length)).Max();
	const maxPartLength = 6; // for paths to be *globally* sortable, we have to hard-code a large max-part-length (we choose 6, so system can sort values from range 0-999,999)
	return parts.map(part=>part.padStart(maxPartLength, "0")).join("/");
}
export function AreRectsEqual(rect1: VRect|n, rect2: VRect|n, fieldsToCheck = ["x", "y", "width", "height"]) {
	for (const field of fieldsToCheck) {
		if (rect1?.[field] != rect2?.[field]) return false;
	}
	return true;
}

export class WaveEffects {
	updateColumns = false;
	recalcLineSourcePoint = false;
	recalcLCAlign = false;
	recalcCHShift = false;
	updateLCRect = false;
	updateCHRect = false;
}

export class NodeGroup {
	constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">) {
		Object.assign(this, data);
		this.path_parts = this.path.split("/");
		this.path_sortable = TreePathAsSortableStr(this.path);
	}
	graph: Graph;
	path: string;
	path_parts: string[];
	path_sortable: string;

	leftColumnEl: HTMLElement|n;
	leftColumn_connectorOpts: NodeConnectorOpts;
	leftColumn_userData: Object;
	leftColumn_alignWithParent?: boolean;
	//leftColumnEl_sizeChangesToIgnore = 0;
	childHolderEl: HTMLElement|n;
	//childHolderEl_sizeChangesToIgnore = 0;
	childHolder_belowParent = false;

	get GutterWidth() {
		return this.leftColumn_connectorOpts.gutterWidth + (this.leftColumn_connectorOpts.parentIsAbove ? this.leftColumn_connectorOpts.parentGutterWidth : 0);
	}

	// pos
	assignedPosition = Vector2.zero;

	// sizes (inputs/observed; just storage for "actual rects" observed)
	lcSize: Vector2|n;
	innerUISize: Vector2|n;
	/*get InnerUISize_WithMargin() {
		if (this.innerUISize == null || this.leftColumn_connectorOpts == null) return null;
		return this.innerUISize.Plus(this.leftColumn_connectorOpts.gutterWidth, 0);
	}*/
	lineSourcePoint: number|n;

	// pos+size
	leftColumnEl_layoutCount = 0;
	lcRect_atLastRender: VRect|n;
	innerUIRect_atLastRender: VRect|n;
	get LCRect() {
		if (this.lcSize == null) return null;
		return new VRect(this.assignedPosition.NewY(y=>y - (this.lcSize!.y / 2)), this.lcSize);
	}
	get InnerUIRect() {
		if (this.innerUISize == null) return null;
		return new VRect(this.assignedPosition.NewX(x=>x + this.GutterWidth).NewY(y=>y - (this.innerUISize!.y / 2)), this.innerUISize);
	}

	DetachAndDestroy() {
		this.Detach();

		// we want to make sure nothing tries to use this group after this point, so destroy it (ie. mangle its fields) so we detect bugs
		this.Destroy();
	}
	Detach() {
		this.graph.groupsByPath.delete(this.path);
	}
	IsDestroyed() {
		return this.path == "[this object has been destroyed; seeing this indicates a bug]";
	}
	Destroy() {
		//console.log("Destroying node-group:", this);
		/*this.leftColumnEl?.remove();
		this.connectorLinesComp?.remove();
		this.childHolderEl?.remove();*/
		for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a=>a["name"] != "IsDestroyed").concat(Object.entries(this))) {
			this[key] = "[this object has been destroyed; seeing this indicates a bug]";
		}
	}
}

const compsWithForceUpdateScheduled = new Set<{forceUpdate:()=>any}>();
function RunForceUpdateForScheduledComps() {
	for (const comp of compsWithForceUpdateScheduled) {
		comp.forceUpdate();
	}
	compsWithForceUpdateScheduled.clear();
}

export class NodeConnectorInfo {
	constructor(data: NodeConnectorInfo) {
		Object.assign(this, data);
	}
	group: NodeGroup;
	rect: VRect|n;
	opts: NodeConnectorOpts|n;
}