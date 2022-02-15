import {Assert, CE, Vector2, VRect} from "js-vextensions";
import {Graph} from "../Graph.js";
import {n, RequiredBy} from "../Utils/@Internal/Types.js";
import {Args, GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative, Method, StrForChange, UnwrapArgs} from "../Utils/General/General.js";
import {TreeColumn} from "./TreeColumn.js";
import {ConnectorLinesUI, ConnectorLinesUI_Handle, NodeConnectorOpts} from "../UI/ConnectorLinesUI.js";
import {Wave} from "../Waves/Wave.js";
import {IDetached, MyCHMounted, MyCHRectChanged, MyCHResized, MyCHShiftChanged, MyCHUnmounted, MyInnerUIRectChanged, MyLCAlignChanged, MyLCRectChanged, MyLCResized, MyLineSourcePointChanged, MyPrevGroupRectBottomChanged, XHasChildY} from "../index.js";
import React from "react";

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
	updateConnectorLines = false;
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
	columnsPartOf: TreeColumn[] = [];
	
	leftColumnEl: HTMLElement|n;
	leftColumn_connectorOpts?: NodeConnectorOpts;
	leftColumn_alignWithParent?: boolean;
	//leftColumnEl_sizeChangesToIgnore = 0;
	childHolderEl: HTMLElement|n;
	//childHolderEl_sizeChangesToIgnore = 0;
	childHolder_belowParent = false;
	connectorLinesComp: ConnectorLinesUI_Handle|n;

	// inputs/observed (just storage for "actual rects" observed)
	lcRect: VRect|n;
	innerUIRect: VRect|n;
	lineSourcePoint: number|n;
	chRect: VRect|n;
	get CHRect_Valid() {
		return this.chRect != null && this.chRect.width > 0 && this.chRect.height > 0;
	}
	/*QuickShiftRects(wave: Wave, delta: Vector2) {
		Assert(wave.phase == "up", "Can only call QuickShiftRects during wave's up-phase!");
		if (this.lcRect) {
			this.lcRect.x += delta.x;
			this.lcRect.y += delta.y;
		}
		if (this.innerUIRect) {
			this.innerUIRect.x += delta.x;
			this.innerUIRect.y += delta.y;
		}
		if (this.lineSourcePoint) {
			this.lineSourcePoint += delta.y;
		}
		if (this.chRect) {
			this.chRect.x += delta.x;
			this.chRect.y += delta.y;
		}
	}*/
	ForceUpdateRects(wave: Wave) {
		if (this.IsDestroyed()) return; // temp; probably only needed because of the "hack/workaround" calls to ForceUpdateRects
		//Assert(wave.phase == "up", "Can only call ForceUpdateRects during wave's up-phase!");
		this.lcRect = this.leftColumnEl ? GetRectRelative(this.leftColumnEl, this.graph.containerEl) : null;
		this.innerUIRect = this.leftColumnEl && this.lcRect ? this.lcRect.NewTop(top=>top + GetPaddingTopFromStyle(this.leftColumnEl!.style)) : null;
		this.chRect = this.childHolderEl ? GetRectRelative(this.childHolderEl, this.graph.containerEl) : null;
	}


	// base rects
	/** Same as innerUIRect, but with the y-pos reduced to what it'd be if its container (ie. the left-column element) had set no padding-top; works alongside CHRect_Base(). */
	get InnerUIRect_Base() {
		// old approach
		/*const chRect = this.CHRect_Base;
		if (chRect == null) return null;
		return chRect.Position.y + ((this.innerUIRect?.height ?? 0) / 2);*/
		// new approach
		if (this.leftColumnEl == null) return null;
		return this.innerUIRect?.NewY(y=>y - GetPaddingTopFromStyle(this.leftColumnEl!.style));
	}
	/** Same as chRect, but with the margin removed; this is the "base"/resting-rect, which is the stable/reference point for (potentially multi-level) alignment operations. */
	get CHRect_Base() {
		if (this.childHolderEl == null) return null;
		let marginTop = GetMarginTopFromStyle(this.childHolderEl.style);
		return this.chRect?.NewY(a=>a - marginTop);
	}

	// space transformers (just some simple helpers, to clarify intent)
	ConvertToGlobalSpace_YPos(yPos: number, oldSpace_rect: VRect) { return oldSpace_rect.y + yPos; }
	ConvertFromGlobalSpace_YPos(yPos: number, newSpace_rect: VRect) { return yPos - newSpace_rect.y; }

	ReceiveDownWave(wave: Wave) {
		let fx = new WaveEffects();

		for (const msg of wave.Messages) {
			if (msg instanceof MyCHMounted) {
				if (msg.me == this) fx.recalcCHShift = true;
			} else if (msg instanceof MyLCResized) {
				if (msg.me == this) fx.updateLCRect = true;
			} else if (msg instanceof MyCHResized) {
				if (msg.me == this) fx.updateCHRect = true;
			} else if (msg instanceof MyPrevGroupRectBottomChanged) {
				if (msg.me == this) {
					//fx.updateLCRect = true;
					//fx.updateCHRect = true;
					fx.recalcCHShift = true;
				}
			} else if (msg instanceof MyCHUnmounted) {
				if (msg.me == this) {
					fx.recalcLineSourcePoint = true;
					fx.recalcLCAlign = true;
					fx.updateLCRect = true;
					for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
						wave.AddEchoWave(new Wave(this.graph, nextGroup, [
							new MyPrevGroupRectBottomChanged({me: nextGroup, sender_extra: `prevGroup:${this.path}`})
						]));
					}
				}
			}
		}

		this.RunEffects(fx, wave);
	}
	ReceiveUpWave(wave: Wave) {
		let fx = new WaveEffects();

		for (const msg of wave.Messages) {
			if (msg instanceof MyInnerUIRectChanged) {
				if (msg.me == this) {
					fx.recalcLineSourcePoint = true;
					fx.recalcLCAlign = true;
					fx.updateConnectorLines = true;
				} else if (XHasChildY(this, msg.me)) {
					const childGroups = this.graph.FindChildGroups(this);
					const childGroupToAlignWithOurInnerUI = childGroups.find(a=>a.leftColumn_alignWithParent);
					if (childGroupToAlignWithOurInnerUI != null) {
						fx.recalcCHShift = true;
						//if (this.path == "0/0/1/1") debugger;
					}

					// these might not be needed
					fx.recalcLineSourcePoint = true;
					fx.recalcLCAlign = true;

					fx.updateConnectorLines = true;
				}
			} else if (msg instanceof MyCHRectChanged) {
				if (msg.me == this) {
					fx.updateColumns = true;
					fx.recalcLineSourcePoint = true;
					fx.recalcLCAlign = true;
				}
			}
		}

		this.RunEffects(fx, wave);
	}
	RunEffects(fx: WaveEffects, wave: Wave) {
		if (fx.updateColumns) this.UpdateColumns();

		// this needs to happen once *first*, since lc-align and such can depend on the location of the child inner-ui-centers
		if (fx.recalcCHShift) this.RecalculateChildHolderShift(wave);

		if (fx.recalcLineSourcePoint) this.RecalculateLineSourcePoint(wave);
		if (fx.recalcLCAlign) this.RecalculateLeftColumnAlign(wave);

		// todo: fix that the below had to be commented for the map-loading to work (...better) in dm-repo

		/*if (fx.recalcCHShift)*/ this.RecalculateChildHolderShift(wave);

		/*if (fx.updateLCRect)*/ this.UpdateLCRect(wave);
		/*if (fx.updateCHRect)*/ this.UpdateCHRect(wave);
		/*if (fx.updateConnectorLines)*/ this.UpdateConnectorLines();
	}

	UpdateLCRect(wave: Wave) {
		const oldRect = this.lcRect;
		const newRect = this.leftColumnEl ? GetRectRelative(this.leftColumnEl, this.graph.containerEl) : null;
		const anchorPointDelta = newRect && oldRect ? new Vector2(newRect.Right - oldRect.Right, newRect.y - oldRect.y) : null;
		const rectChanged = !AreRectsEqual(newRect, oldRect);
		if (rectChanged) {
			//this.graph.uiDebugKit?.FlashComp(this.leftColumnEl, {text: `LCRect:${StrForChange(oldRect, newRect)}`});
			this.lcRect = newRect;
			wave.AddMessage(new MyLCRectChanged({me: this, oldRect, newRect}));

			this.UpdateInnerUIRect(wave); // this doesn't count as a "response", since it's just a data-field, which I'd otherwise just add to UpdateRects() directly

			// if lc-rect right-edge changes, then the x-pos of the ch-rect needs to change, so call UpdateCHRect
			if (newRect?.Right != oldRect?.Right) {
				this.UpdateCHRect(wave);
			}

			// same-column
			let echoesSentTo = [] as string[];
			if (newRect?.Bottom != oldRect?.Bottom) {
				// todo: fix that this fails for the case where our lc-rect's height progressively increases (due to child-contents loading), with peer nodes below it that are not expanded
				//		(since they're not expanded, they're not recognized as "next groups" by the column system, and so their rects become outdated -- causing the connector-lines )
				for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
					echoesSentTo.push(nextGroup.path);
					wave.AddEchoWave(new Wave(this.graph, nextGroup, [
						new MyPrevGroupRectBottomChanged({me: nextGroup, sender_extra: `prevGroup:${this.path}`})
					]));
				}
			}
		}
		return {newRect, oldRect, rectChanged};
	}
	/** Only to be called from NodeGroup.UpdateLCRect(). */
	private UpdateInnerUIRect(wave: Wave) {
		const oldRect = this.innerUIRect;
		const newRect = this.leftColumnEl && this.lcRect ? this.lcRect.NewTop(top=>top + GetPaddingTopFromStyle(this.leftColumnEl!.style)) : null;
		const rectChanged = !AreRectsEqual(newRect, oldRect);
		if (rectChanged) {
			this.innerUIRect = newRect;
			wave.AddMessage(new MyInnerUIRectChanged({me: this, oldRect, newRect}));
		}
	}
	UpdateCHRect(wave: Wave) {
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
			this.chRect = newRect;

			this.UpdateColumns(); // for echo-waves, must ensure up-to-date

			// same-column
			let echoesSentTo = [] as string[];
			if (newRect?.Bottom != oldRect?.Bottom) {
				for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
					echoesSentTo.push(nextGroup.path);
					wave.AddEchoWave(new Wave(this.graph, nextGroup, [
						new MyPrevGroupRectBottomChanged({me: nextGroup, sender_extra: `prevGroup:${this.path}`})
					]));
				}
			}

			wave.AddMessage(new MyCHRectChanged({me: this, oldRect, newRect, echoesSentTo}));
		}
		return {newRect, oldRect, rectChanged};
	}

	UpdateColumns() {
		const oldColumnsList = this.columnsPartOf;
		const newColumnsList = this.graph.GetColumnsForGroup(this);
		//Assert(newColumnsList.length > 0, "NodeGroup.UpdateColumns called, but no intersecting columns found!");
		const columnsToAdd = CE(newColumnsList).Exclude(...this.columnsPartOf);
		const columnsToRemove = CE(this.columnsPartOf).Exclude(...newColumnsList);
		//const columnsToRemove_nextGroups = columnsToRemove.map(column=>column.FindNextGroup(this));

		// first change the groups
		columnsToAdd.forEach(a=>a.AddGroup(this));
		columnsToRemove.forEach(a=>a.RemoveGroup(this));
		this.columnsPartOf = newColumnsList;

		/*this.graph.uiDebugKit?.FlashComp(this.leftColumnEl, {
			text: `Columns:${StrForChange(oldColumnsList.map(a=>a.index).join(","), this.columnsPartOf.map(a=>a.index).join(","))}`
		});*/

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
			new Wave(this.graph, nextGroup, [
				new IDetached({me: this}),
			]).Down_StartWave();
		}
	}
	IsDestroyed() {
		return this.path == "[this object has been destroyed; seeing this indicates a bug]";
	}
	Destroy() {
		console.log("Destroying node-group:", this);
		/*this.leftColumnEl?.remove();
		this.connectorLinesComp?.remove();
		this.childHolderEl?.remove();*/
		for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a=>a["name"] != "IsDestroyed").concat(Object.entries(this))) {
			this[key] = "[this object has been destroyed; seeing this indicates a bug]";
		}
	}

	RecalculateChildHolderShift(wave: Wave, updateCHRectFirst = true) {
		if (updateCHRectFirst) {
			this.UpdateCHRect(wave); // needed, in certain cases
			this.UpdateLCRect(wave); // needed fsr
		}
		
		if (this.childHolderEl == null) return;
		if (this.leftColumnEl == null) return;
		if (this.chRect == null) return;

		//if (checkForRectChangeFirst) this.CheckForMoveOrResize();

		// if child-holder is below parent, it just uses relative positioning, so no need for manual margins/shifts
		// (this check happens after the UpdateRects, because some callers rely on UpdateRects being called [even if the shift itself isn't necessary]) // todo: probably clean this up
		if (this.childHolder_belowParent) return;

		let oldMarginTop = GetMarginTopFromStyle(this.childHolderEl.style);
		const innerUIHeight = this.innerUIRect?.height ?? 0;
		let idealMarginTop = -(this.chRect!.height / 2) + (innerUIHeight / 2);

		const childGroups = this.graph.FindChildGroups(this);
		const childGroupToAlignWithOurInnerUI = childGroups.find(a=>a.leftColumn_alignWithParent);
		if (childGroupToAlignWithOurInnerUI && childGroupToAlignWithOurInnerUI.innerUIRect) {
			childGroupToAlignWithOurInnerUI.ForceUpdateRects(wave); // todo: remove this workaround/hack

			const childGroupInnerUICenter = childGroupToAlignWithOurInnerUI.innerUIRect.Center.y;
			const childGroupInnerUICenter_base = childGroupInnerUICenter - oldMarginTop;
			// set ideal margin-top to the value that would align the given child-group with our (left-column) inner-ui's center
			idealMarginTop = this.InnerUIRect_Base!.Center.y - childGroupInnerUICenter_base;
			//if (idealMarginTop < -100) debugger;
		}
		
		let maxMarginTop = idealMarginTop;
		let prevGroups = new Set<NodeGroup>();
		for (const column of this.graph.GetColumnsForGroup(this)) {
			const rectToStayBelow = column.rect.NewBottom(GetPaddingTopFromStyle(this.graph.containerEl.style))
			maxMarginTop = Math.max(maxMarginTop, CE(rectToStayBelow.Bottom - this.CHRect_Base!.Top).KeepAtLeast(idealMarginTop));

			const columnPrevGroups = column.FindPreviousGroups(this);
			if (columnPrevGroups.length) {
				for (const prevGroup of columnPrevGroups) {
					if (prevGroups.has(prevGroup)) continue;
					prevGroups.add(prevGroup);
					//previousGroup?.UpdateRect(); // this is necessary in some cases; idk why, but I don't have time to investigate atm
					//console.log("Checking1");
					const rectToStayBelow = prevGroup.chRect;
					if (rectToStayBelow == null) continue;

					maxMarginTop = Math.max(maxMarginTop, CE(rectToStayBelow.Bottom - this.CHRect_Base!.Top).KeepAtLeast(idealMarginTop));
					//if (isNaN(maxMarginTop)) debugger;
				}
			}
		}
		maxMarginTop = Math.floor(maxMarginTop);
		//this.graph.uiDebugKit?.FlashComp(this.childHolderEl, {text: `CH-shift[mt]:${StrForChange(oldMarginTop, maxMarginTop)} @prevGroups:[${[...previousGroups].map(a=>a.path).join(",")}]`});
		const newMarginTop = maxMarginTop;

		if (newMarginTop != oldMarginTop) {
			this.childHolderEl.style.marginTop = `${newMarginTop}px`;
			wave.AddMessage(new MyCHShiftChanged({me: this, oldVal: oldMarginTop, newVal: newMarginTop}));
			
			// we just changed the margin, so update our rects (ResizeObserver can't detect this)
			this.UpdateCHRect(wave);

			// our descendants rects are now outdated; we are in up-wave phase, so cannot call update funcs on them, but we can call the side-effect-less ForceUpdateRects method
			if (wave.phase == "up") {
				const delta = new Vector2(0, newMarginTop - oldMarginTop);
				for (const descendant of this.graph.FindDescendantGroups(this)) {
					//descendant.QuickShiftRects(wave, delta);
					descendant.ForceUpdateRects(wave);
				}
			}
			
			//this.UpdateCHRect(false, false); // don't check for effects (other than left-column-align below); for this code-path, other effects do not need checking/updating [are you sure?]
			//this.RecalculateLeftColumnAlign({extResponse: true, from: "RecalculateChildHolderShift"});
			//setTimeout(()=>this.RecalculateLeftColumnAlign());
			
			/*for (const nextGroup of this.graph.GetNextGroupsWithinColumnsFor(this)) {
				nextGroup.CheckForMoveOrResize();
			}*/
		}
	}
	/** Stores the y-pos that should be used as the center target for the inner-ui's center, and the child-holder's connector-lines origins/anchors. (in global space) */
	RecalculateLineSourcePoint(wave: Wave) {
		const oldSourcePoint = this.lineSourcePoint;
		let newSourcePoint: number|null = null;
		if (this.childHolderEl != null && this.CHRect_Valid) {
			newSourcePoint = this.chRect!.Center.y;

			const childGroups = this.graph.FindChildGroups(this);
			const childGroupToAlignWithOurInnerUI = childGroups.find(a=>a.leftColumn_alignWithParent);
			if (childGroupToAlignWithOurInnerUI && childGroupToAlignWithOurInnerUI.innerUIRect) {
				newSourcePoint = childGroupToAlignWithOurInnerUI.innerUIRect.Center.y;
			}
		}

		if (newSourcePoint != oldSourcePoint) {
			this.lineSourcePoint = newSourcePoint;
			wave.AddMessage(new MyLineSourcePointChanged({me: this, oldVal: oldSourcePoint, newVal: newSourcePoint}));
		}
	}
	RecalculateLeftColumnAlign(wave: Wave) {
		// if child-holder is below parent, it just uses relative positioning, so no need for manual paddings/alignment of the left-column
		if (this.childHolder_belowParent) return;
		// left-column must not be attached yet; ignore (this is fine, cause left-column will rerun this func on mount)
		if (this.leftColumnEl == null || this.lcRect == null) return console.log(`Couldn't find leftColumnEl, for:${this.path}`);

		const innerUIHeight = this.innerUIRect?.height ?? 0;
		let oldPaddingTop = GetPaddingTopFromStyle(this.leftColumnEl.style);
		
		let alignPoint = this.lineSourcePoint ?? 0;
		let newPaddingTop = CE(alignPoint - (innerUIHeight / 2) - this.lcRect.y).KeepAtLeast(0); // can't have negative padding
		newPaddingTop = Math.floor(newPaddingTop);
		//this.graph.uiDebugKit?.FlashComp(this.leftColumnEl, {text: `LC-align[pt]:${StrForChange(oldPaddingTop, newPaddingTop)} @innerUIHeight:${innerUIHeight} @alignPoint:${alignPoint} @chRect:${this.chRect}`});

		if (newPaddingTop != oldPaddingTop) {
			this.leftColumnEl.style.paddingTop = `${newPaddingTop}px`;
			wave.AddMessage(new MyLCAlignChanged({me: this, oldVal: oldPaddingTop, newVal: newPaddingTop}));

			// ResizeObserver does *not* watch for margin/padding changes, so we must notify of the left-column-rect changing ourselves
			this.UpdateLCRect(wave);
			
			// we also have to refresh our connector-lines (the origin point changed)
			this.RefreshConnectorLinesUI();
		}
	}

	// connector-lines system
	// ==========

	childConnectorInfos = new Map<number, NodeConnectorInfo>();
	UpdateConnectorLines() {
		/*if (this.chRect == null) return;
		const newRect_rel = newRect?.NewPosition(pos=>pos.Minus(this.chRect!.Position));*/
		for (const [i, childGroup] of this.graph.FindChildGroups(this).entries()) {
			const newInfo = new NodeConnectorInfo({
				group: childGroup,
				rect: childGroup.innerUIRect,
				opts: childGroup.leftColumn_connectorOpts,
			});
			this.childConnectorInfos.set(i, newInfo);
		}
		this.RefreshConnectorLinesUI();
	}
	RefreshConnectorLinesUI() {
		if (this.connectorLinesComp == null) return;
		//this.connectorLinesComp.forceUpdate();
		const isFirstEntry = compsWithForceUpdateScheduled.size == 0;
		compsWithForceUpdateScheduled.add(this.connectorLinesComp);
		if (isFirstEntry) {
			requestAnimationFrame(RunForceUpdateForScheduledComps);
		}
		//this.graph.uiDebugKit?.FlashComp(this.connectorLinesComp.svgEl as any, {text: `Refreshed connector-lines-ui.`}); // commented; doesn't work atm (can't flash svg-element)
	}
}

const compsWithForceUpdateScheduled = new Set<{forceUpdate: ()=>any}>();
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