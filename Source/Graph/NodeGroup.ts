import {Assert, CE, VRect} from "js-vextensions";
import {Graph} from "../Graph.js";
import {n, RequiredBy} from "../Utils/@Internal/Types.js";
import {GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative} from "../Utils/General/General.js";
import {TreeColumn} from "./TreeColumn.js";

/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath: string) {
	const parts = treePath.split("/");
	const maxPartLength = CE(parts.map(a=>a.length)).Max();
	return parts.map(part=>part.padStart(maxPartLength, "0")).join("/");
}
export function AreRectsEqual(rect1: VRect|n, rect2: VRect|n, fieldsToCheck = ["x", "y", "width", "height"]) {
	for (const field of fieldsToCheck) {
		if (rect1?.[field] != rect2?.[field]) return false;
	}
	return true;
}

export class NodeGroup {
	constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">) {
		Object.assign(this, data);
	}
	graph: Graph;
	path: string;
	get ParentPath_Sortable() { return TreePathAsSortableStr(this.path); }
	columnsPartOf: TreeColumn[] = [];
	
	leftColumnEl: HTMLElement|n;
	//rightColumnEl: HTMLElement;
	childHolderEl: HTMLElement|n;

	// inputs/observed
	// we don't use lcRect as much, so just refetch it each call
	get LCRect() {
		if (this.leftColumnEl == null) return new VRect(0, 0, 0, 0); // atm, we only use LCRect's height, so a height of 0 is fine while waiting for left-column to finish rendering
		//return VRect.FromLTWH(this.leftColumnEl.getBoundingClientRect());
		return this.leftColumnEl.getBoundingClientRect(); // atm we only use the height, so just return the native rect-struct
	}
	rect: VRect|n; // just storage for "actual rect" observed
	// what the rect would be if we removed the above-gap/top-margin (ie. if we didn't care about intersections)
	/*get rect_base(): VRect|n {
		if (this.childHolderEl == null || this.rect == null) return null;
		return this.rect.NewY(y=>y - GetMarginTopFromStyle(this.childHolderEl!.style));
	}*/

	UpdateRect(checkForSameColumnEffects = true, checkForRightColumnEffects = true) {
		const oldRect = this.rect;
		//this.rect = GetPageRect(this.childHolderEl);
		//const newRect = VRect.FromLTWH(this.childHolderEl.getBoundingClientRect());
		//console.log("Checking1");
		const newRect = this.childHolderEl ? GetRectRelative(this.childHolderEl, this.graph.containerEl) : null;
		const rectChanged = !AreRectsEqual(newRect, oldRect);
		//Object.assign(store, {width: newWidth, height: newHeight});
		//this.graph.uiDebugKit?.FlashComp(this.childHolderEl, {text: `Rendering... @rect:${newRect} @oldRect:${oldRect}`});

		// if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
		if (rectChanged) {
			this.graph.uiDebugKit?.FlashComp(this.childHolderEl, {text: `Rect changed. @rect:${newRect}`});
			this.rect = newRect;
			this.UpdateColumns();
			if (checkForSameColumnEffects) this.CheckForSameColumnEffectsFromRectChange(newRect, oldRect);
			if (checkForRightColumnEffects) this.CheckForRightColumnEffectsFromRectChange(newRect, oldRect);
		}
		return {newRect, oldRect, rectChanged};
	}
	
	CheckForSameColumnEffectsFromRectChange(newRect: VRect|n, oldRect: VRect|n) {
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
				childGroup.UpdateRect(); // need to call this, since it can respond to, eg. x-pos changes
			}
		} else if (changeCanAffectChildGroupShifts) {
			const childGroups = this.graph.FindChildGroups(this);
			for (const childGroup of childGroups) {
				childGroup.RecalculateChildHolderShift();
			}
		}
	}
	CheckForRightColumnEffectsFromRectChange(newRect: VRect|n, oldRect: VRect|n) {
		const changeCanAffectChildGroupsThoroughly = !AreRectsEqual(newRect, oldRect, ["x", "width"]);
		// technically we should also be checking if the *positions* of any child in our group has changed; ignoring for now, since pos-changes always imply size-changes atm (in my use-cases)
		const changeCanAffectChildGroupShifts = !AreRectsEqual(newRect, oldRect, ["y", "height"]);
		if (changeCanAffectChildGroupsThoroughly) {
			const childGroups = this.graph.FindChildGroups(this);
			for (const childGroup of childGroups) {
				childGroup.UpdateRect(); // need to call this, since it can respond to, eg. x-pos changes
			}
		} else if (changeCanAffectChildGroupShifts) {
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
		const columnsToRemove_nextGroups = columnsToRemove.map(column=>column.FindNextGroup(this));

		// first change the groups
		columnsToAdd.forEach(a=>a.AddGroup(this));
		columnsToRemove.forEach(a=>a.RemoveGroup(this));
		this.columnsPartOf = newColumnsList;

		// then apply the effects (must do after, else we can get a recursive situation where the columnsPartOf is out-of-date)
		for (const column of columnsToAdd) {
			const nextGroup = column.FindNextGroup(this);
			if (nextGroup) nextGroup.RecalculateChildHolderShift();
		}
		for (const [i, column] of columnsToRemove.entries()) {
			const nextGroup = columnsToRemove_nextGroups[i];
			if (nextGroup) nextGroup.RecalculateChildHolderShift();
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
		for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a=>a["name"] != "IsDestroyed").concat(Object.entries(this))) {
			this[key] = "[this object has been destroyed; seeing this indicates a bug]";
		}
	}

	RecalculateChildHolderShift(updateRectFirst = true) {
		if (this.childHolderEl == null || this.rect == null) return;
		if (updateRectFirst) this.UpdateRect();
		//if (checkForRectChangeFirst) this.CheckForMoveOrResize();

		const leftColumnHeight = this.LCRect.height;
		const leftColumnHeight_withoutPadding = leftColumnHeight - (this.leftColumnEl ? GetPaddingTopFromStyle(this.leftColumnEl.style) : 0);
		const idealMarginTop = -(this.rect.height / 2) + (leftColumnHeight_withoutPadding / 2);
		
		let oldMarginTop = GetMarginTopFromStyle(this.childHolderEl.style);
		let maxMarginTop = idealMarginTop;
		let previousGroups = new Set<NodeGroup>();
		for (const column of this.graph.GetColumnsForGroup(this)) {
			const previousGroup = column.FindPreviousGroup(this);
			if (previousGroup) previousGroups.add(previousGroup);
			//previousGroup?.UpdateRect(); // this is necessary in some cases; idk why, but I don't have time to investigate atm
			//console.log("Checking1");
			const rectToStayBelow = previousGroup?.rect ?? column.rect.NewBottom(GetPaddingTopFromStyle(this.graph.containerEl.style));

			const deltaToBeJustBelow = rectToStayBelow.Bottom - this.rect.Top;
			maxMarginTop = Math.max(maxMarginTop, CE(oldMarginTop + deltaToBeJustBelow).KeepAtLeast(idealMarginTop));
			//if (isNaN(maxMarginTop)) debugger;

			//const pathForAboveGap = ;
		}
		maxMarginTop = Math.floor(maxMarginTop);
		this.graph.uiDebugKit?.FlashComp(this.childHolderEl, {text: `Recalced ch-shift. @newMT:${maxMarginTop} @prevGroups:[${[...previousGroups].map(a=>a.path).join(",")}]`});

		if (maxMarginTop != oldMarginTop) {
			this.childHolderEl.style.marginTop = `${maxMarginTop}px`;
			this.RecalculateLeftColumnAlign();
			/*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
				nextGroup.CheckForMoveOrResize();
			}*/
		}
	}

	RecalculateLeftColumnAlign() {
		// left-column must not be attached yet; ignore (this is fine, cause left-column will rerun this func on mount)
		if (this.leftColumnEl == null) return console.log(`Couldn't find leftColumnEl, for:${this.path}`);

		const leftColumnHeight = this.LCRect.height;
		const leftColumnHeight_withoutPadding = leftColumnHeight - GetPaddingTopFromStyle(this.leftColumnEl.style);
		
		let alignPoint = 0;
		if (this.childHolderEl != null) {
			alignPoint = GetMarginTopFromStyle(this.childHolderEl.style) + ((this.rect?.height ?? 0) / 2);
		}
		let gapBeforeInnerUI = CE(alignPoint - (leftColumnHeight_withoutPadding / 2)).KeepAtLeast(0); // can't have negative padding
		gapBeforeInnerUI = Math.floor(gapBeforeInnerUI);
		this.graph.uiDebugKit?.FlashComp(this.leftColumnEl, {text: `Recalced lc-align. @newPT:${gapBeforeInnerUI} @lcHeight_wp:${leftColumnHeight_withoutPadding}`});

		this.leftColumnEl.style.paddingTop = `${gapBeforeInnerUI}px`;
	}
}