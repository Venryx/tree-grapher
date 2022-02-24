import { Vector2, VRect } from "js-vextensions";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath) {
    const parts = treePath.split("/");
    //const maxPartLength = CE(parts.map(a=>a.length)).Max();
    const maxPartLength = 6; // for paths to be *globally* sortable, we have to hard-code a large max-part-length (we choose 6, so system can sort values from range 0-999,999)
    return parts.map(part => part.padStart(maxPartLength, "0")).join("/");
}
export function AreRectsEqual(rect1, rect2, fieldsToCheck = ["x", "y", "width", "height"]) {
    for (const field of fieldsToCheck) {
        if ((rect1 === null || rect1 === void 0 ? void 0 : rect1[field]) != (rect2 === null || rect2 === void 0 ? void 0 : rect2[field]))
            return false;
    }
    return true;
}
export class WaveEffects {
    constructor() {
        this.updateColumns = false;
        this.recalcLineSourcePoint = false;
        this.recalcLCAlign = false;
        this.recalcCHShift = false;
        this.updateLCRect = false;
        this.updateCHRect = false;
    }
}
export class NodeGroup {
    constructor(data) {
        //childHolderEl_sizeChangesToIgnore = 0;
        this.childHolder_belowParent = false;
        // pos
        this.assignedPosition = Vector2.zero;
        // pos+size
        this.leftColumnEl_layoutCount = 0;
        Object.assign(this, data);
        this.path_parts = this.path.split("/");
        this.path_sortable = TreePathAsSortableStr(this.path);
    }
    get GutterWidth() {
        return this.leftColumn_connectorOpts.gutterWidth + (this.leftColumn_connectorOpts.parentIsAbove ? this.leftColumn_connectorOpts.parentGutterWidth : 0);
    }
    get LCRect() {
        if (this.lcSize == null)
            return null;
        return new VRect(this.assignedPosition.NewY(y => y - (this.lcSize.y / 2)), this.lcSize);
    }
    get InnerUIRect() {
        if (this.innerUISize == null)
            return null;
        return new VRect(this.assignedPosition.NewX(x => x + this.GutterWidth).NewY(y => y - (this.innerUISize.y / 2)), this.innerUISize);
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
        for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a => a["name"] != "IsDestroyed").concat(Object.entries(this))) {
            this[key] = "[this object has been destroyed; seeing this indicates a bug]";
        }
    }
}
const compsWithForceUpdateScheduled = new Set();
function RunForceUpdateForScheduledComps() {
    for (const comp of compsWithForceUpdateScheduled) {
        comp.forceUpdate();
    }
    compsWithForceUpdateScheduled.clear();
}
export class NodeConnectorInfo {
    constructor(data) {
        Object.assign(this, data);
    }
}
