import { Assert, Vector2, VRect } from "js-vextensions";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath) {
    const parts = treePath.split("/");
    //const maxPartLength = CE(parts.map(a=>a.length)).Max();
    const maxPartLength = 6; // for paths to be *globally* sortable, we have to hard-code a large max-part-length (we choose 6, so system can sort values from range 0-999,999)
    return parts.map(part => part.padStart(maxPartLength, "0")).join("/");
}
export function AreRectsEqual(rect1, rect2, fieldsToCheck = ["x", "y", "width", "height"]) {
    for (const field of fieldsToCheck) {
        if (rect1?.[field] != rect2?.[field])
            return false;
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
    constructor(data) {
        Object.assign(this, data);
        this.path_parts = this.path.split("/");
        this.path_sortable = TreePathAsSortableStr(this.path);
    }
    graph;
    path;
    path_parts;
    path_sortable;
    leftColumnEl;
    leftColumn_connectorOpts;
    leftColumn_userData;
    leftColumn_alignWithParent;
    //leftColumnEl_sizeChangesToIgnore = 0;
    childHolderEl;
    //childHolderEl_sizeChangesToIgnore = 0;
    childHolder_belowParent = false;
    get GutterWidth() {
        return this.leftColumn_connectorOpts.gutterWidth + (this.leftColumn_connectorOpts.parentIsAbove ? this.leftColumn_connectorOpts.parentGutterWidth : 0);
    }
    // pos
    assignedPosition = Vector2.zero; // raw value obtained from own graph, for layout position
    assignedPosition_final = Vector2.zero; // like assignedPosition, except includes modifications due to animation
    // sizes (inputs/observed; just storage for "actual rects" observed)
    lcSize_old; // based on getBoundingClientRect()
    lcSize; // based on offsetWidth/offsetHeight
    innerUISize_old; // based on getBoundingClientRect()
    innerUISize; // based on offsetWidth/offsetHeight
    /*get InnerUISize_WithMargin() {
        if (this.innerUISize == null || this.leftColumn_connectorOpts == null) return null;
        return this.innerUISize.Plus(this.leftColumn_connectorOpts.gutterWidth, 0);
    }*/
    lineSourcePoint;
    // pos+size
    leftColumnEl_layoutCount = 0;
    lcRect_atLastRender;
    innerUIRect_atLastRender;
    get LCRect_Old() {
        if (this.lcSize == null)
            return null;
        return new VRect(this.assignedPosition_final.NewY(y => y - (this.lcSize.y / 2)), this.lcSize);
    }
    get LCRect() {
        if (this.lcSize == null)
            return null;
        return new VRect(this.assignedPosition_final.NewY(y => y - (this.lcSize.y / 2)), this.lcSize);
    }
    get InnerUIRect_Old() {
        if (this.innerUISize == null)
            return null;
        return new VRect(this.assignedPosition_final.NewX(x => x + this.GutterWidth).NewY(y => y - (this.innerUISize.y / 2)), this.innerUISize);
    }
    get InnerUIRect() {
        if (this.innerUISize == null)
            return null;
        return new VRect(this.assignedPosition_final.NewX(x => x + this.GutterWidth).NewY(y => y - (this.innerUISize.y / 2)), this.innerUISize);
    }
    DetachAndDestroy() {
        this.Detach();
        // we want to make sure nothing tries to use this group after this point, so destroy it (ie. mangle its fields) so we detect bugs
        this.Destroy();
    }
    Detach() {
        this.graph.groupsByPath.delete(this.path);
        // for groupsByParentPath optimization
        const parentPath = this.path.split("/").slice(0, -1).join("/");
        if (parentPath.length) {
            const groupsUnderParent = this.graph.groupsByParentPath.get(parentPath);
            if (globalThis.DEV) {
                Assert(groupsUnderParent != null, "List of children-groups for parent-group is missing!");
                Assert(groupsUnderParent.has(this.path), "List of children-groups for parent-group does not contain the node currently being detached!");
            }
            groupsUnderParent.delete(this.path);
            if (groupsUnderParent?.size == 0) {
                this.graph.groupsByParentPath.delete(parentPath);
            }
        }
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
    group;
    rect;
    opts;
}
