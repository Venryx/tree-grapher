import { CE, Vector2 } from "js-vextensions";
import { GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative, Method, StrForChange } from "../Utils/General/General.js";
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
        this.UpdateRects = Method({ from: "n/a" }, { intResponse: true, extResponse: true }, FinalArgs => args => {
            const { from, intResponse, extResponse } = FinalArgs(args);
            this.UpdateLCRect({ intResponse, extResponse, from: `UpdateRects<-${from}` });
            this.UpdateCHRect({ intResponse, extResponse, from: `UpdateRects<-${from}` });
        });
        this.UpdateLCRect = Method({ from: "n/a" }, { intResponse: true, extResponse: true }, FinalArgs => args => {
            var _a;
            const { from, intResponse, extResponse } = FinalArgs(args);
            const oldRect = this.lcRect;
            const newRect = this.leftColumnEl ? GetRectRelative(this.leftColumnEl, this.graph.containerEl) : null;
            const anchorPointDelta = newRect && oldRect ? new Vector2(newRect.Right - oldRect.Right, newRect.y - oldRect.y) : null;
            const rectChanged = !AreRectsEqual(newRect, oldRect);
            if (rectChanged) {
                (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.leftColumnEl, { text: `LCRect:${StrForChange(oldRect, newRect)} @from:${from}` });
                this.lcRect = newRect;
                this.UpdateInnerUIRect({ intResponse, extResponse, from: "UpdateLCRect" }); // this doesn't count as a "response", since it's just a data-field, which I'd otherwise just add to UpdateRects() directly
                if (intResponse) {
                    // if lc-rect right-edge changes, then the x-pos of the ch-rect needs to change, so call UpdateCHRect
                    if ((newRect === null || newRect === void 0 ? void 0 : newRect.Right) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Right)) {
                        this.UpdateCHRect({ intResponse, extResponse, from: "UpdateLCRect" });
                    }
                }
            }
            return { newRect, oldRect, rectChanged };
        });
        /** Only to be called from NodeGroup.UpdateLCRect(). */
        this.UpdateInnerUIRect = Method({ from: "n/a" }, { intResponse: true, extResponse: true }, FinalArgs => args => {
            var _a, _b;
            const { from, intResponse, extResponse } = FinalArgs(args);
            const oldRect = this.innerUIRect;
            const newRect = this.leftColumnEl && this.lcRect ? this.lcRect.NewTop(top => top + GetPaddingTopFromStyle(this.leftColumnEl.style)) : null;
            const rectChanged = !AreRectsEqual(newRect, oldRect);
            if (rectChanged) {
                this.innerUIRect = newRect;
                if (intResponse) {
                    // recalc lc-align *if* the height changed (don't recalc on pos change, else could start a loop)
                    if ((newRect === null || newRect === void 0 ? void 0 : newRect.height) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.height)) {
                        this.RecalculateLeftColumnAlign({ extResponse, from: `UpdateInnerUIRect` });
                    }
                }
                if (extResponse) {
                    if ((newRect === null || newRect === void 0 ? void 0 : newRect.Center.y) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Center.y)) {
                        const pathParts = this.path.split("/");
                        const parentGroup = this.graph.groupsByPath.get(pathParts.slice(0, -1).join("/"));
                        (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.leftColumnEl, { text: `InnerUI center:${StrForChange(oldRect === null || oldRect === void 0 ? void 0 : oldRect.Center.y, newRect === null || newRect === void 0 ? void 0 : newRect.Center.y)}. Try tell parent:${(_b = parentGroup === null || parentGroup === void 0 ? void 0 : parentGroup.path) !== null && _b !== void 0 ? _b : "null"} @from:${from}` });
                        const newInfo = new NodeConnectorInfo({ rect: newRect, opts: this.leftColumn_connectorOpts });
                        if (parentGroup)
                            parentGroup.NotifyChildNodeConnectorInfoChanged(Number(pathParts.slice(-1)[0]), newInfo);
                    }
                }
            }
        });
        this.UpdateCHRect = Method({ from: "n/a" }, { intResponse: true, extResponse: true }, FinalArgs => args => {
            var _a, _b;
            const { from, intResponse, extResponse } = FinalArgs(args);
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
                (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp((_b = this.childHolderEl) !== null && _b !== void 0 ? _b : this.leftColumnEl, { text: `CHRect:${StrForChange(oldRect, newRect)} @from:${from}` });
                this.chRect = newRect;
                if (intResponse) {
                    this.UpdateColumns();
                    this.RecalculateLeftColumnAlign({ extResponse, from: "UpdateCHRect" }); // this is very cheap, so just always do it
                    // if our group's size just reduced (eg. by one of our nodes collapsing its children), we need to recalc our shift to ensure we don't extend past the map's top-border
                    //this.RecalculateChildHolderShift(false);
                }
                if (extResponse) {
                    // same-column
                    if ((newRect === null || newRect === void 0 ? void 0 : newRect.Top) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Top)) {
                        for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                            nextGroup.RecalculateChildHolderShift({ from: "CheckForOtherGroupEffectsFromRectChange" });
                        }
                    }
                    // right-column
                    if ((newRect === null || newRect === void 0 ? void 0 : newRect.Top) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Top) || (newRect === null || newRect === void 0 ? void 0 : newRect.Right) != (oldRect === null || oldRect === void 0 ? void 0 : oldRect.Right)) {
                        /*const descendants = this.graph.FindDescendantGroups(this);
                        for (const descendant of CE(descendants).OrderBy(a=>a.path_sortable)) {
                            //descendant.QuickShiftRects(anchorPointDelta);
                            descendant.UpdateRects({intResponse: true, extResponse: true, from: "UpdateLCRect"});
                        }*/
                        const childGroups = this.graph.FindChildGroups(this);
                        for (const childGroup of childGroups) {
                            // need to call this, since it can respond to, eg. x-pos changes // todo: can we narrow this?
                            childGroup.UpdateRects({ from: "CheckForOtherGroupEffectsFromRectChange" });
                        }
                    }
                }
            }
            return { newRect, oldRect, rectChanged };
        });
        this.RecalculateChildHolderShift = Method({ from: "n/a" }, { updateRectFirst: true }, FinalArgs => args => {
            var _a, _b, _c, _d;
            const { from, updateRectFirst } = FinalArgs(args);
            if (this.childHolderEl == null || this.chRect == null)
                return;
            if (updateRectFirst)
                this.UpdateRects({ from: "RecalculateChildHolderShift" });
            //if (checkForRectChangeFirst) this.CheckForMoveOrResize();
            // if child-holder is below parent, it just uses relative positioning, so no need for manual margins/shifts
            // (this check happens after the UpdateRects, because some callers rely on UpdateRects being called [even if the shift itself isn't necessary]) // todo: probably clean this up
            if (this.childHolder_belowParent)
                return;
            let oldMarginTop = GetMarginTopFromStyle(this.childHolderEl.style);
            const innerUIHeight = (_b = (_a = this.innerUIRect) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0;
            let idealMarginTop = -(this.chRect.height / 2) + (innerUIHeight / 2);
            const childGroups = this.graph.FindChildGroups(this);
            const childGroupToAlignWithOurInnerUI = childGroups.find(a => a.leftColumn_alignWithParent);
            if (childGroupToAlignWithOurInnerUI && childGroupToAlignWithOurInnerUI.innerUIRect) {
                const childGroupInnerUICenter = childGroupToAlignWithOurInnerUI.innerUIRect.Center.y;
                const childGroupInnerUICenter_base = childGroupInnerUICenter - oldMarginTop;
                // set ideal margin-top to the value that would align the given child-group with our (left-column) inner-ui's center
                idealMarginTop = this.InnerUIRect_Base.Center.y - childGroupInnerUICenter_base;
            }
            let maxMarginTop = idealMarginTop;
            let previousGroups = new Set();
            for (const column of this.graph.GetColumnsForGroup(this)) {
                const previousGroup = column.FindPreviousGroup(this);
                if (previousGroup)
                    previousGroups.add(previousGroup);
                //previousGroup?.UpdateRect(); // this is necessary in some cases; idk why, but I don't have time to investigate atm
                //console.log("Checking1");
                const rectToStayBelow = (_c = previousGroup === null || previousGroup === void 0 ? void 0 : previousGroup.chRect) !== null && _c !== void 0 ? _c : column.rect.NewBottom(GetPaddingTopFromStyle(this.graph.containerEl.style));
                maxMarginTop = Math.max(maxMarginTop, CE(rectToStayBelow.Bottom - this.CHRect_Base.Top).KeepAtLeast(idealMarginTop));
                //if (isNaN(maxMarginTop)) debugger;
                //const pathForAboveGap = ;
            }
            maxMarginTop = Math.floor(maxMarginTop);
            (_d = this.graph.uiDebugKit) === null || _d === void 0 ? void 0 : _d.FlashComp(this.childHolderEl, { text: `CH-shift[mt]:${StrForChange(oldMarginTop, maxMarginTop)} @prevGroups:[${[...previousGroups].map(a => a.path).join(",")}] @from:${from}` });
            if (maxMarginTop != oldMarginTop) {
                this.childHolderEl.style.marginTop = `${maxMarginTop}px`;
                // we just changed the margin, so update our rects (ResizeObserver can't detect this)
                for (const childGroup of this.graph.FindChildGroups(this)) {
                    childGroup.UpdateLCRect({ from: "RecalculateChildHolderShift [from parent]" });
                }
                this.UpdateCHRect({ from: "RecalculateChildHolderShift" });
                //this.UpdateCHRect(false, false); // don't check for effects (other than left-column-align below); for this code-path, other effects do not need checking/updating [are you sure?]
                //this.RecalculateLeftColumnAlign({extResponse: true, from: "RecalculateChildHolderShift"});
                //setTimeout(()=>this.RecalculateLeftColumnAlign());
                /*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                    nextGroup.CheckForMoveOrResize();
                }*/
            }
        });
        /** Returns the y-pos that should be used as the center target for the inner-ui's center, and the child-holder's connector-lines origins/anchors. (in global space) */
        this.ChildHolderAnchorPoint = Method({ from: "n/a" }, { extResponse: true, allowUpdatingChildRectFirst: false }, FinalArgs => args => {
            const { from, extResponse, allowUpdatingChildRectFirst } = FinalArgs(args);
            let result = null;
            if (this.childHolderEl != null && this.CHRect_Valid) {
                result = this.chRect.Center.y;
                const childGroups = this.graph.FindChildGroups(this);
                const childGroupToAlignWithOurInnerUI = childGroups.find(a => a.leftColumn_alignWithParent);
                if (childGroupToAlignWithOurInnerUI && childGroupToAlignWithOurInnerUI.innerUIRect) {
                    if (allowUpdatingChildRectFirst) {
                        childGroupToAlignWithOurInnerUI.RecalculateLeftColumnAlign({ extResponse, from: "ChildHolderAnchorPoint" });
                    }
                    result = childGroupToAlignWithOurInnerUI.innerUIRect.Center.y;
                }
            }
            return result;
        });
        this.RecalculateLeftColumnAlign = Method({ from: "n/a" }, { extResponse: true }, FinalArgs => args => {
            var _a, _b, _c, _d;
            const { from, extResponse } = FinalArgs(args);
            // if child-holder is below parent, it just uses relative positioning, so no need for manual paddings/alignment of the left-column
            if (this.childHolder_belowParent)
                return;
            // left-column must not be attached yet; ignore (this is fine, cause left-column will rerun this func on mount)
            if (this.leftColumnEl == null || this.lcRect == null)
                return console.log(`Couldn't find leftColumnEl, for:${this.path}`);
            const innerUIHeight = (_b = (_a = this.innerUIRect) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0;
            let oldPaddingTop = GetPaddingTopFromStyle(this.leftColumnEl.style);
            let alignPoint = (_c = this.ChildHolderAnchorPoint({ allowUpdatingChildRectFirst: true, extResponse, from: "RecalculateLeftColumnAlign" })) !== null && _c !== void 0 ? _c : 0;
            let newPaddingTop = CE(alignPoint - (innerUIHeight / 2) - this.lcRect.y).KeepAtLeast(0); // can't have negative padding
            newPaddingTop = Math.floor(newPaddingTop);
            (_d = this.graph.uiDebugKit) === null || _d === void 0 ? void 0 : _d.FlashComp(this.leftColumnEl, { text: `LC-align[pt]:${StrForChange(oldPaddingTop, newPaddingTop)} @innerUIHeight:${innerUIHeight} @alignPoint:${alignPoint} @chRect:${this.chRect} @from:${from}` });
            if (newPaddingTop != oldPaddingTop) {
                this.leftColumnEl.style.paddingTop = `${newPaddingTop}px`;
                // ResizeObserver does *not* watch for margin/padding changes, so we must notify of the left-column-rect changing ourselves
                this.UpdateLCRect({ from: "RecalculateLeftColumnAlign", extResponse });
                // we also have to refresh our connector-lines (the origin point changed)
                this.RefreshConnectorLinesUI();
            }
        });
        // connector-lines system
        // ==========
        this.childConnectorInfos = new Map();
        Object.assign(this, data);
        this.path_sortable = TreePathAsSortableStr(this.path);
    }
    get CHRect_Valid() {
        return this.chRect != null && this.chRect.width > 0 && this.chRect.height > 0;
    }
    /*QuickShiftRects(delta: Vector2) {
        if (this.lcRect) {
            this.lcRect.x += delta.x;
            this.lcRect.y += delta.y;
        }
        if (this.innerUIRect) {
            this.innerUIRect.x += delta.x;
            this.innerUIRect.y += delta.y;
        }
        if (this.chRect) {
            this.chRect.x += delta.x;
            this.chRect.y += delta.y;
        }
    }*/
    // base rects
    /** Same as innerUIRect, but with the y-pos reduced to what it'd be if its container (ie. the left-column element) had set no padding-top; works alongside CHRect_Base(). */
    get InnerUIRect_Base() {
        var _a;
        // old approach
        /*const chRect = this.CHRect_Base;
        if (chRect == null) return null;
        return chRect.Position.y + ((this.innerUIRect?.height ?? 0) / 2);*/
        // new approach
        if (this.leftColumnEl == null)
            return null;
        return (_a = this.innerUIRect) === null || _a === void 0 ? void 0 : _a.NewY(y => y - GetPaddingTopFromStyle(this.leftColumnEl.style));
    }
    /** Same as chRect, but with the margin removed; this is the "base"/resting-rect, which is the stable/reference point for (potentially multi-level) alignment operations. */
    get CHRect_Base() {
        var _a;
        if (this.childHolderEl == null)
            return null;
        let marginTop = GetMarginTopFromStyle(this.childHolderEl.style);
        return (_a = this.chRect) === null || _a === void 0 ? void 0 : _a.NewY(a => a - marginTop);
    }
    // space transformers (just some simple helpers, to clarify intent)
    ConvertToGlobalSpace_YPos(yPos, oldSpace_rect) { return oldSpace_rect.y + yPos; }
    ConvertFromGlobalSpace_YPos(yPos, newSpace_rect) { return yPos - newSpace_rect.y; }
    UpdateColumns() {
        var _a;
        const oldColumnsList = this.columnsPartOf;
        const newColumnsList = this.graph.GetColumnsForGroup(this);
        //Assert(newColumnsList.length > 0, "NodeGroup.UpdateColumns called, but no intersecting columns found!");
        const columnsToAdd = CE(newColumnsList).Exclude(...this.columnsPartOf);
        const columnsToRemove = CE(this.columnsPartOf).Exclude(...newColumnsList);
        const columnsToRemove_nextGroups = columnsToRemove.map(column => column.FindNextGroup(this));
        // first change the groups
        columnsToAdd.forEach(a => a.AddGroup(this));
        columnsToRemove.forEach(a => a.RemoveGroup(this));
        this.columnsPartOf = newColumnsList;
        (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.leftColumnEl, {
            text: `Columns:${StrForChange(oldColumnsList.map(a => a.index).join(","), this.columnsPartOf.map(a => a.index).join(","))}`
        });
        // then apply the effects (must do after, else we can get a recursive situation where the columnsPartOf is out-of-date)
        /*for (const column of columnsToAdd) {
            const nextGroup = column.FindNextGroup(this);
            //if (nextGroup) nextGroup.RecalculateChildHolderShift();
            if (nextGroup) nextGroup.UpdateRects();
        }
        for (const [i, column] of columnsToRemove.entries()) {
            const nextGroup = columnsToRemove_nextGroups[i];
            if (nextGroup) nextGroup.RecalculateChildHolderShift();
        }*/
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
            nextGroup.RecalculateChildHolderShift({ from: "Detach" });
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
    NotifyChildNodeConnectorInfoChanged(childIndex, newInfo) {
        /*if (this.chRect == null) return;
        const newRect_rel = newRect?.NewPosition(pos=>pos.Minus(this.chRect!.Position));*/
        this.childConnectorInfos.set(childIndex, newInfo);
        this.RefreshConnectorLinesUI();
    }
    RefreshConnectorLinesUI() {
        if (this.connectorLinesComp == null)
            return;
        this.connectorLinesComp.forceUpdate();
        //this.graph.uiDebugKit?.FlashComp(this.connectorLinesComp.svgEl as any, {text: `Refreshed connector-lines-ui.`}); // commented; doesn't work atm (can't flash svg-element)
    }
}
export class NodeConnectorInfo {
    constructor(data) {
        Object.assign(this, data);
    }
}
