import {CE, VRect} from "js-vextensions";
import {Graph} from "../Graph.js";
import {RequiredBy} from "../Utils/@Internal/Types.js";

/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath: string) {
	const parts = treePath.split("/");
	const maxPartLength = CE(parts.map(a=>a.length)).Max();
	return parts.map(part=>part.padStart(maxPartLength, "0")).join("/");
}

export function GetMarginTopFromStyle(style: CSSStyleDeclaration) {
	if (style.marginTop == "") return 0;
	if (style.marginTop.includes("px")) return parseFloat(style.marginTop);
	return 0; // ignores %-margins and such (we don't use %-margins in tree-grapher)
}
export class NodeGroup {
	constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "parentPath" | "element" | "rect">) {
		Object.assign(this, data);
	}
	graph: Graph;
	parentPath: string;
	get ParentPath_Sortable() { return TreePathAsSortableStr(this.parentPath); }
	element: HTMLElement;

	// inputs/observed
	rect: VRect; // just storage for "actual rect" observed
	// what the rect would be if we removed the above-gap/top-margin (ie. if we didn't care about intersections)
	get rect_base(): VRect {
		return this.rect.NewY(y=>y - GetMarginTopFromStyle(this.element.style));
	}

	UpdateRect() {
		const oldRect = this.rect;
		const newRect = VRect.FromLTWH(this.element.getBoundingClientRect());
		const rectChanged = !newRect.Equals(this.rect);
		//Object.assign(store, {width: newWidth, height: newHeight});
		//graph.uiDebugKit?.FlashComp(ref.current, {text: `Rendering... @rc:${store.renderCount} @rect:${newRect}`});

		// if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
		if (rectChanged) {
			this.rect = newRect;
		}
		return {newRect, oldRect, rectChanged};
	}
	/** Updates this.rect, then notifies next-groups of their potentially needing to update their shifts. */
	CheckForMoveOrResize() {
		const {newRect, oldRect, rectChanged} = this.UpdateRect();
		if (rectChanged) {
			this.graph.uiDebugKit?.FlashComp(this.element, {text: `Rect changed. @rect:${newRect}`});
			const changeCanAffectOwnShift = !newRect.NewY(-1).Equals(oldRect.NewY(-1)); // a simple y-pos change isn't meaningful; we already track+react-to that part "in-system"
			if (changeCanAffectOwnShift) {
				for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
					nextGroup.RecalculateShift();
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
			} else if (changeCanAffectChildGroupShifts) {
				const childGroups = this.graph.FindChildGroups(this);
				for (const childGroup of childGroups) {
					childGroup.RecalculateShift();
				}
			}
		}
	}

	/** Make sure this.rect is up-to-date before calling this. (can call this.UpdateRect() beforehand) */
	RecalculateShift(updateRectFirst = true) {
		if (updateRectFirst) this.UpdateRect();
		//if (checkForRectChangeFirst) this.CheckForMoveOrResize();
		
		let oldMarginTop = GetMarginTopFromStyle(this.element.style);
		let maxMarginTop = 0;
		for (const column of this.graph.GetColumnsForGroup(this)) {
			const previousGroup = column.FindPreviousGroup(this);
			const rectToStayBelow = previousGroup?.rect ?? column.rect.NewBottom(0);

			const deltaToBeJustBelow = rectToStayBelow.Bottom - this.rect.Top;
			maxMarginTop = Math.max(maxMarginTop, CE(oldMarginTop + deltaToBeJustBelow).KeepAtLeast(0));
			//if (isNaN(maxMarginTop)) debugger;

			//const pathForAboveGap = ;
		}
		this.graph.uiDebugKit?.FlashComp(this.element, {text: `Recalculated shift. @newMarginTop:${maxMarginTop}`});

		if (maxMarginTop != oldMarginTop) {
			this.element.style.marginTop = `${maxMarginTop}px`;
			/*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
				nextGroup.CheckForMoveOrResize();
			}*/
		}
	}
}