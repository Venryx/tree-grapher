import { CE } from "js-vextensions";
import { GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative } from "../Utils/General/General.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath) {
    const parts = treePath.split("/");
    const maxPartLength = CE(parts.map(a => a.length)).Max();
    return parts.map(part => part.padStart(maxPartLength, "0")).join("/");
}
export function AreRectsEqual(rect1, rect2, fieldsToCheck = ["x", "y", "width", "height"]) {
    for (const field of fieldsToCheck) {
        if ((rect1 === null || rect1 === void 0 ? void 0 : rect1[field]) != (rect2 === null || rect2 === void 0 ? void 0 : rect2[field]))
            return false;
    }
    return true;
}
export class NodeGroup {
    constructor(data) {
        this.columnsPartOf = [];
        this.childHolder_belowParent = false;
        // connector-lines system
        // ==========
        this.childRects = new Map();
        Object.assign(this, data);
    }
    get ParentPath_Sortable() { return TreePathAsSortableStr(this.path); }
    UpdateRects() {
        this.UpdateLCRect();
        this.UpdateCHRect();
    }
    UpdateLCRect() {
        var _a;
        const oldRect = this.lcRect;
        const newRect = this.leftColumnEl ? GetRectRelative(this.leftColumnEl, this.graph.containerEl) : null;
        const rectChanged = !AreRectsEqual(newRect, oldRect);
        if (rectChanged) {
            (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.leftColumnEl, { text: `LCRect changed. @rect:${newRect}` });
            this.lcRect = newRect;
            this.UpdateInnerUIRect();
        }
        return { newRect, oldRect, rectChanged };
    }
    /** Only to be called from NodeGroup.UpdateLCRect(). */
    UpdateInnerUIRect() {
        var _a, _b;
        const oldRect = this.innerUIRect;
        const newRect = this.leftColumnEl && this.lcRect ? this.lcRect.NewTop(top => top + GetPaddingTopFromStyle(this.leftColumnEl.style)) : null;
        const rectChanged = !AreRectsEqual(newRect, oldRect);
        if (rectChanged) {
            this.innerUIRect = newRect;
            // check for effects
            // ==========
            // recalc lc-align *if* the height changed (don't recalc on pos change, else could start a loop)
            if ((newRect === null || newRect === void 0 ? void 0 : newRect.height) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.height)) {
                this.RecalculateLeftColumnAlign();
            }
            if ((newRect === null || newRect === void 0 ? void 0 : newRect.Center.y) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Center.y)) {
                const pathParts = this.path.split("/");
                const parentGroup = this.graph.groupsByPath.get(pathParts.slice(0, -1).join("/"));
                (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.leftColumnEl, { text: `InnerUI center-changed; try tell parent. @parentGroup:${(_b = parentGroup === null || parentGroup === void 0 ? void 0 : parentGroup.path) !== null && _b !== void 0 ? _b : "null"}` });
                if (parentGroup)
                    parentGroup.NotifyChildNodeLCRectChanged(Number(pathParts.slice(-1)[0]), newRect);
            }
        }
    }
    UpdateCHRect(checkForSameColumnEffects = true, checkForRightColumnEffects = true) {
        var _a;
        const oldRect = this.chRect;
        //this.rect = GetPageRect(this.childHolderEl);
        //const newRect = VRect.FromLTWH(this.childHolderEl.getBoundingClientRect());
        //console.log("Checking1");
        const newRect = this.childHolderEl ? GetRectRelative(this.childHolderEl, this.graph.containerEl) : null;
        const rectChanged = !AreRectsEqual(newRect, oldRect);
        //Object.assign(store, {width: newWidth, height: newHeight});
        //this.graph.uiDebugKit?.FlashComp(this.childHolderEl, {text: `Rendering... @rect:${newRect} @oldRect:${oldRect}`});
        // if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
        if (rectChanged) {
            (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.childHolderEl, { text: `Rect changed. @rect:${newRect}` });
            this.chRect = newRect;
            this.UpdateColumns();
            if (checkForSameColumnEffects)
                this.CheckForSameColumnEffectsFromRectChange(newRect, oldRect);
            if (checkForRightColumnEffects)
                this.CheckForRightColumnEffectsFromRectChange(newRect, oldRect);
        }
        return { newRect, oldRect, rectChanged };
    }
    CheckForSameColumnEffectsFromRectChange(newRect, oldRect) {
        this.RecalculateLeftColumnAlign(); // this is very cheap, so just always do it
        //const changeCanAffectOwnShift = !newRect.NewY(-1).Equals(oldRect.NewY(-1)); // a simple y-pos change isn't meaningful; we already track+react-to that part "in-system"
        const changeCanAffectOwnShift = !AreRectsEqual(newRect, oldRect);
        if (changeCanAffectOwnShift) {
            // if our group's size just reduced (eg. by one of our nodes collapsing its children), we need to recalc our shift to ensure we don't extend past the map's top-border
            //this.RecalculateChildHolderShift(false);
            for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                nextGroup.RecalculateChildHolderShift();
            }
        }
        const changeCanAffectChildGroupsThoroughly = !AreRectsEqual(newRect, oldRect, ["x", "width"]);
        // technically we should also be checking if the *positions* of any child in our group has changed; ignoring for now, since pos-changes always imply size-changes atm (in my use-cases)
        const changeCanAffectChildGroupShifts = !AreRectsEqual(newRect, oldRect, ["y", "height"]);
        if (changeCanAffectChildGroupsThoroughly) {
            const childGroups = this.graph.FindChildGroups(this);
            for (const childGroup of childGroups) {
                childGroup.UpdateRects(); // need to call this, since it can respond to, eg. x-pos changes // todo: can we narrow this?
            }
        }
        else if (changeCanAffectChildGroupShifts) {
            const childGroups = this.graph.FindChildGroups(this);
            for (const childGroup of childGroups) {
                childGroup.RecalculateChildHolderShift();
            }
        }
    }
    CheckForRightColumnEffectsFromRectChange(newRect, oldRect) {
        const changeCanAffectChildGroupsThoroughly = !AreRectsEqual(newRect, oldRect, ["x", "width"]);
        // technically we should also be checking if the *positions* of any child in our group has changed; ignoring for now, since pos-changes always imply size-changes atm (in my use-cases)
        const changeCanAffectChildGroupShifts = !AreRectsEqual(newRect, oldRect, ["y", "height"]);
        if (changeCanAffectChildGroupsThoroughly) {
            const childGroups = this.graph.FindChildGroups(this);
            for (const childGroup of childGroups) {
                childGroup.UpdateRects(); // need to call this, since it can respond to, eg. x-pos changes // todo: can we narrow this?
            }
        }
        else if (changeCanAffectChildGroupShifts) {
            const childGroups = this.graph.FindChildGroups(this);
            for (const childGroup of childGroups) {
                childGroup.RecalculateChildHolderShift();
            }
        }
    }
    UpdateColumns() {
        const newColumnsList = this.graph.GetColumnsForGroup(this);
        //Assert(newColumnsList.length > 0, "NodeGroup.UpdateColumns called, but no intersecting columns found!");
        const columnsToAdd = CE(newColumnsList).Exclude(...this.columnsPartOf);
        const columnsToRemove = CE(this.columnsPartOf).Exclude(...newColumnsList);
        const columnsToRemove_nextGroups = columnsToRemove.map(column => column.FindNextGroup(this));
        // first change the groups
        columnsToAdd.forEach(a => a.AddGroup(this));
        columnsToRemove.forEach(a => a.RemoveGroup(this));
        this.columnsPartOf = newColumnsList;
        // then apply the effects (must do after, else we can get a recursive situation where the columnsPartOf is out-of-date)
        for (const column of columnsToAdd) {
            const nextGroup = column.FindNextGroup(this);
            if (nextGroup)
                nextGroup.RecalculateChildHolderShift();
        }
        for (const [i, column] of columnsToRemove.entries()) {
            const nextGroup = columnsToRemove_nextGroups[i];
            if (nextGroup)
                nextGroup.RecalculateChildHolderShift();
        }
    }
    DetachAndDestroy() {
        this.Detach();
        // we want to make sure nothing tries to use this group after this point, so destroy it (ie. mangle its fields) so we detect bugs
        this.Destroy();
    }
    Detach() {
        const nextGroups = this.graph.GetNextGroupsWithinColumnsFor(this);
        this.graph.groupsByPath.delete(this.path);
        for (const column of this.columnsPartOf) {
            column.RemoveGroup(this);
        }
        for (const nextGroup of nextGroups) {
            nextGroup.RecalculateChildHolderShift();
        }
        // wait a tick for UI to actually be destroyed, then recalc stuff
        /*WaitXThenRun(0, ()=>{
            group.RecalculateLeftColumnAlign(); // back to 0
            for (const nextGroup of nextGroups) {
                nextGroup.RecalculateChildHolderShift();
            }
        });*/
    }
    IsDestroyed() {
        return this.path == "[this object has been destroyed; seeing this indicates a bug]";
    }
    Destroy() {
        for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a => a["name"] != "IsDestroyed").concat(Object.entries(this))) {
            this[key] = "[this object has been destroyed; seeing this indicates a bug]";
        }
    }
    RecalculateChildHolderShift(updateRectFirst = true) {
        var _a, _b, _c, _d;
        if (this.childHolderEl == null || this.chRect == null)
            return;
        if (updateRectFirst)
            this.UpdateRects();
        //if (checkForRectChangeFirst) this.CheckForMoveOrResize();
        // if child-holder is below parent, it just uses relative positioning, so no need for manual margins/shifts
        // (this check happens after the UpdateRects, because some callers rely on UpdateRects being called [even if the shift itself isn't necessary]) // todo: probably clean this up
        if (this.childHolder_belowParent)
            return;
        const innerUIHeight = (_b = (_a = this.lcRect) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0;
        const idealMarginTop = -(this.chRect.height / 2) + (innerUIHeight / 2);
        let oldMarginTop = GetMarginTopFromStyle(this.childHolderEl.style);
        let maxMarginTop = idealMarginTop;
        let previousGroups = new Set();
        for (const column of this.graph.GetColumnsForGroup(this)) {
            const previousGroup = column.FindPreviousGroup(this);
            if (previousGroup)
                previousGroups.add(previousGroup);
            //previousGroup?.UpdateRect(); // this is necessary in some cases; idk why, but I don't have time to investigate atm
            //console.log("Checking1");
            const rectToStayBelow = (_c = previousGroup === null || previousGroup === void 0 ? void 0 : previousGroup.chRect) !== null && _c !== void 0 ? _c : column.rect.NewBottom(GetPaddingTopFromStyle(this.graph.containerEl.style));
            const deltaToBeJustBelow = rectToStayBelow.Bottom - this.chRect.Top;
            maxMarginTop = Math.max(maxMarginTop, CE(oldMarginTop + deltaToBeJustBelow).KeepAtLeast(idealMarginTop));
            //if (isNaN(maxMarginTop)) debugger;
            //const pathForAboveGap = ;
        }
        maxMarginTop = Math.floor(maxMarginTop);
        (_d = this.graph.uiDebugKit) === null || _d === void 0 ? void 0 : _d.FlashComp(this.childHolderEl, { text: `Recalced ch-shift. @newMT:${maxMarginTop} @prevGroups:[${[...previousGroups].map(a => a.path).join(",")}]` });
        if (maxMarginTop != oldMarginTop) {
            this.childHolderEl.style.marginTop = `${maxMarginTop}px`;
            this.RecalculateLeftColumnAlign();
            /*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                nextGroup.CheckForMoveOrResize();
            }*/
        }
    }
    RecalculateLeftColumnAlign() {
        var _a, _b, _c, _d, _e;
        // if child-holder is below parent, it just uses relative positioning, so no need for manual paddings/alignment of the left-column
        if (this.childHolder_belowParent)
            return;
        // left-column must not be attached yet; ignore (this is fine, cause left-column will rerun this func on mount)
        if (this.leftColumnEl == null)
            return console.log(`Couldn't find leftColumnEl, for:${this.path}`);
        const innerUIHeight = (_b = (_a = this.innerUIRect) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0;
        let alignPoint = 0;
        if (this.childHolderEl != null) {
            alignPoint = GetMarginTopFromStyle(this.childHolderEl.style) + (((_d = (_c = this.chRect) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0) / 2);
        }
        let newPaddingTop = CE(alignPoint - (innerUIHeight / 2)).KeepAtLeast(0); // can't have negative padding
        newPaddingTop = Math.floor(newPaddingTop);
        (_e = this.graph.uiDebugKit) === null || _e === void 0 ? void 0 : _e.FlashComp(this.leftColumnEl, { text: `Recalced lc-align. @newPT:${newPaddingTop} @lcHeight_wp:${innerUIHeight}` });
        let oldPaddingTop = GetPaddingTopFromStyle(this.leftColumnEl.style);
        if (newPaddingTop != oldPaddingTop) {
            this.leftColumnEl.style.paddingTop = `${newPaddingTop}px`;
            // ResizeObserver does *not* watch for margin/padding changes, so we must notify of the left-column-rect changing ourselves
            this.UpdateLCRect();
            // we also have to refresh our connector-lines (the origin point changed)
            this.RefreshConnectorLinesUI();
        }
    }
    NotifyChildNodeLCRectChanged(childIndex, newRect) {
        /*if (this.chRect == null) return;
        const newRect_rel = newRect?.NewPosition(pos=>pos.Minus(this.chRect!.Position));*/
        this.childRects.set(childIndex, newRect);
        this.RefreshConnectorLinesUI();
    }
    RefreshConnectorLinesUI() {
        var _a;
        if (this.connectorLinesComp == null)
            return;
        this.connectorLinesComp.forceUpdate();
        (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.connectorLinesComp.svgEl, { text: `Refreshed connector-lines-ui.` });
    }
}
