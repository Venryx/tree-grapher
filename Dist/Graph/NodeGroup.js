import { CE } from "js-vextensions";
import { GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative } from "../Utils/General/General.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath) {
    const parts = treePath.split("/");
    const maxPartLength = CE(parts.map(a => a.length)).Max();
    return parts.map(part => part.padStart(maxPartLength, "0")).join("/");
}
export class NodeGroup {
    constructor(data) {
        Object.assign(this, data);
    }
    get ParentPath_Sortable() { return TreePathAsSortableStr(this.path); }
    // what the rect would be if we removed the above-gap/top-margin (ie. if we didn't care about intersections)
    get rect_base() {
        if (this.childHolderEl == null || this.rect == null)
            return null;
        return this.rect.NewY(y => y - GetMarginTopFromStyle(this.childHolderEl.style));
    }
    UpdateRect() {
        if (this.childHolderEl == null)
            return null;
        const oldRect = this.rect;
        //const newRect = VRect.FromLTWH(this.childHolderEl.getBoundingClientRect());
        const newRect = GetRectRelative(this.childHolderEl, this.graph.containerEl);
        const rectChanged = !newRect.Equals(this.rect);
        //Object.assign(store, {width: newWidth, height: newHeight});
        //graph.uiDebugKit?.FlashComp(ref.current, {text: `Rendering... @rc:${store.renderCount} @rect:${newRect}`});
        // if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
        if (rectChanged) {
            this.rect = newRect;
        }
        return { newRect, oldRect, rectChanged };
    }
    /** Updates this.rect, then notifies next-groups of their potentially needing to update their shifts. */
    CheckForMoveOrResize() {
        var _a;
        const updateRectResult = this.UpdateRect();
        if (updateRectResult == null)
            return;
        const { newRect, oldRect, rectChanged } = updateRectResult;
        if (rectChanged) {
            (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp(this.childHolderEl, { text: `Rect changed. @rect:${newRect}` });
            this.RecalculateLeftColumnAlign(); // this is very cheap, so just always do it
            //const changeCanAffectOwnShift = !newRect.NewY(-1).Equals(oldRect.NewY(-1)); // a simple y-pos change isn't meaningful; we already track+react-to that part "in-system"
            const changeCanAffectOwnShift = !newRect.Equals(oldRect);
            if (changeCanAffectOwnShift) {
                this.RecalculateChildHolderShift(false); // no need to update rect, we already did
                for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                    nextGroup.RecalculateChildHolderShift();
                }
            }
            const changeCanAffectChildGroupsThoroughly = newRect.x != oldRect.x || newRect.width != oldRect.width;
            // technically we should also be checking if the *positions* of any child in our group has changed; ignoring for now, since pos-changes always imply size-changes atm (in my use-cases)
            const changeCanAffectChildGroupShifts = newRect.y != oldRect.y || newRect.height != oldRect.height;
            if (changeCanAffectChildGroupsThoroughly) {
                const childGroups = this.graph.FindChildGroups(this);
                for (const childGroup of childGroups) {
                    childGroup.CheckForMoveOrResize(); // need to call this, since it can respond to, eg. x-pos changes
                }
            }
            else if (changeCanAffectChildGroupShifts) {
                const childGroups = this.graph.FindChildGroups(this);
                for (const childGroup of childGroups) {
                    childGroup.RecalculateChildHolderShift();
                }
            }
        }
    }
    RecalculateChildHolderShift(updateRectFirst = true) {
        var _a, _b;
        if (this.childHolderEl == null || this.rect == null)
            return;
        if (updateRectFirst)
            this.UpdateRect();
        //if (checkForRectChangeFirst) this.CheckForMoveOrResize();
        const leftColumnHeight = this.leftColumnEl.getBoundingClientRect().height;
        const leftColumnHeight_withoutPadding = leftColumnHeight - GetPaddingTopFromStyle(this.leftColumnEl.style);
        const idealMarginTop = -(this.rect.height / 2) + (leftColumnHeight_withoutPadding / 2);
        let oldMarginTop = GetMarginTopFromStyle(this.childHolderEl.style);
        let maxMarginTop = idealMarginTop;
        let previousGroups = new Set();
        for (const column of this.graph.GetColumnsForGroup(this)) {
            const previousGroup = column.FindPreviousGroup(this);
            if (previousGroup)
                previousGroups.add(previousGroup);
            previousGroup === null || previousGroup === void 0 ? void 0 : previousGroup.UpdateRect(); // this is necessary in some cases; idk why, but I don't have time to investigate atm
            const rectToStayBelow = (_a = previousGroup === null || previousGroup === void 0 ? void 0 : previousGroup.rect) !== null && _a !== void 0 ? _a : column.rect.NewBottom(GetPaddingTopFromStyle(this.graph.containerEl.style));
            const deltaToBeJustBelow = rectToStayBelow.Bottom - this.rect.Top;
            maxMarginTop = Math.max(maxMarginTop, CE(oldMarginTop + deltaToBeJustBelow).KeepAtLeast(idealMarginTop));
            //if (isNaN(maxMarginTop)) debugger;
            //const pathForAboveGap = ;
        }
        maxMarginTop = Math.floor(maxMarginTop);
        (_b = this.graph.uiDebugKit) === null || _b === void 0 ? void 0 : _b.FlashComp(this.childHolderEl, { text: `Recalced ch-shift. @newMT:${maxMarginTop} @prevGroups:[${[...previousGroups].map(a => a.path).join(",")}]` });
        if (maxMarginTop != oldMarginTop) {
            this.childHolderEl.style.marginTop = `${maxMarginTop}px`;
            this.RecalculateLeftColumnAlign();
            /*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
                nextGroup.CheckForMoveOrResize();
            }*/
        }
    }
    RecalculateLeftColumnAlign() {
        var _a, _b;
        // left-column must not be attached yet; ignore (this is fine, cause left-column will rerun this func on mount)
        if (this.leftColumnEl == null)
            return console.log(`Couldn't find leftColumnEl, for:${this.path}`);
        const leftColumnHeight = this.leftColumnEl.getBoundingClientRect().height;
        const leftColumnHeight_withoutPadding = leftColumnHeight - GetPaddingTopFromStyle(this.leftColumnEl.style);
        let alignPoint = 0;
        if (this.childHolderEl != null) {
            alignPoint = GetMarginTopFromStyle(this.childHolderEl.style) + (((_a = this.rect.height) !== null && _a !== void 0 ? _a : 0) / 2);
        }
        let gapBeforeInnerUI = CE(alignPoint - (leftColumnHeight_withoutPadding / 2)).KeepAtLeast(0); // can't have negative padding
        gapBeforeInnerUI = Math.floor(gapBeforeInnerUI);
        (_b = this.graph.uiDebugKit) === null || _b === void 0 ? void 0 : _b.FlashComp(this.leftColumnEl, { text: `Recalced lc-align. @newPT:${gapBeforeInnerUI} @lcHeight_wp:${leftColumnHeight_withoutPadding}` });
        this.leftColumnEl.style.paddingTop = `${gapBeforeInnerUI}px`;
    }
}
