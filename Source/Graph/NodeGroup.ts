import {Assert, CE, Vector2, VRect} from "js-vextensions";
import {Graph} from "../Graph.js";
import {n, RequiredBy} from "../Utils/@Internal/Types.js";
import {Args, GetMarginTopFromStyle, GetPaddingTopFromStyle, GetRectRelative, Method, StrForChange, UnwrapArgs} from "../Utils/General/General.js";
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
	
	leftColumnEl: HTMLElement|n;
	leftColumn_connectorOpts?: NodeConnectorOpts;
	leftColumn_alignWithParent?: boolean;
	//leftColumnEl_sizeChangesToIgnore = 0;
	childHolderEl: HTMLElement|n;
	//childHolderEl_sizeChangesToIgnore = 0;
	childHolder_belowParent = false;
	connectorLinesComp: ConnectorLinesUI_Handle|n;

	// new
	assignedPosition = Vector2.zero;

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
		if (fx.recalcLineSourcePoint) this.RecalculateLineSourcePoint(wave);
		if (fx.recalcLCAlign) this.RecalculateLeftColumnAlign(wave);

		// todo: fix that the below had to be commented for the map-loading to work (...better) in dm-repo

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

			wave.AddMessage(new MyCHRectChanged({me: this, oldRect, newRect}));
		}
		return {newRect, oldRect, rectChanged};
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
		console.log("Destroying node-group:", this);
		/*this.leftColumnEl?.remove();
		this.connectorLinesComp?.remove();
		this.childHolderEl?.remove();*/
		for (const [key, value] of Object.entries(NodeGroup.prototype).filter(a=>a["name"] != "IsDestroyed").concat(Object.entries(this))) {
			this[key] = "[this object has been destroyed; seeing this indicates a bug]";
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