import {CE, Lerp, SleepAsync, Vector2, VRect} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useContext} from "react";
import {n} from "react-vcomponents/Dist/@Types.js";
import {Graph} from "tree-grapher";
import {GetFocusNodePaths, keyframes} from "../@SharedByExamples/NodeData";
import {store} from "../Store";
import {MapContext} from "../Root.js";

//let ignoreNextZoomChange = false;
export const NodeFocuser = observer(function MapScroller(props: {graph: Graph}) {
	const {graph} = props;
	if (graph.containerEl == null) return null;
	const scrollEl = graph.getScrollElFromContainerEl(graph.containerEl);
	if (scrollEl == null) return null;
	//const zoomLevel = store.zoomLevel;
	/*if (ignoreNextZoomChange) {
		ignoreNextZoomChange = false;
		return null;
	}*/

	const mapInfo = useContext(MapContext);
	const lastKeyframe = keyframes.findLast(a=>a.time <= store.targetTime);
	const nextKeyframe = keyframes.find(a=>a.time > store.targetTime);
	if (lastKeyframe == null || nextKeyframe == null) return null;
	const lastFocusNodePaths = GetFocusNodePaths(mapInfo, store.targetTime);
	const nextFocusNodePaths = GetFocusNodePaths(mapInfo, nextKeyframe.time);

	const MergeNodeRects = (nodePaths: string[])=>{
		let nodeRectsMerged: VRect|n;
		for (const group of graph.groupsByPath.values()) {
			const groupNodePath = group.leftColumn_userData?.["nodePath"] as string;
			if (nodePaths.includes(groupNodePath) && group.InnerUIRect) {
				nodeRectsMerged = nodeRectsMerged ? nodeRectsMerged.Encapsulating(group.InnerUIRect) : group.InnerUIRect;
			}
		}
		return nodeRectsMerged;
	};
	const lastFocusNodeRectsMerged = MergeNodeRects(lastFocusNodePaths);
	const nextFocusNodeRectsMerged = MergeNodeRects(nextFocusNodePaths);
	if (lastFocusNodeRectsMerged == null || nextFocusNodeRectsMerged == null) return null;
	const percentFromLastToNext = (store.targetTime - lastKeyframe.time) / (nextKeyframe.time - lastKeyframe.time);
	console.log("percentFromLastToNext:", percentFromLastToNext);
	const focusNodeRects_interpolated = InterpolateRect(lastFocusNodeRectsMerged, nextFocusNodeRectsMerged, percentFromLastToNext);

	const viewportSize = new Vector2(scrollEl.clientWidth, scrollEl.clientHeight);
	// apply just enough zoom-out to be able to fit all of the focus-nodes within the viewport
	const zoomRequired = Math.min(viewportSize.x / focusNodeRects_interpolated.width, viewportSize.y / focusNodeRects_interpolated.height);
	//const newZoom = CE(CE(zoomRequired * .9).FloorTo(.1)).KeepBetween(.1, 1);
	const newZoom = CE(zoomRequired * .9).KeepBetween(.1, 1);

	/*if (CE(newZoom).Distance(zoomLevel) > .01) {
		(async()=>{
			await SleepAsync(1);
			//ignoreNextZoomChange = true;
			store.zoomLevel = newZoom;
			// re-call this function, since we need to recalc // edit: Actually, is this even necessary? I don't think it should be... (well, the ACTUpdateAnchorNodeAndViewOffset call might need the delay)
			//setTimeout(()=>FocusOnNodes(mapID, paths), 100);
			//return;
			await SleepAsync(100);
			doScroll();
		})();
	} else {
		doScroll();
	}*/

	function doScroll() { ScrollToPosition_Center(scrollEl!, focusNodeRects_interpolated.Center.Times(store.zoomLevel)); }
	//function doScroll() { ScrollToPosition_Center(scrollEl!, focusNodeRectsMerged!.Center.DividedBy(store.zoomLevel)); }

	(async()=>{
		await SleepAsync(1);
		//ignoreNextZoomChange = true;
		store.zoomLevel = newZoom;
		// re-call this function, since we need to recalc // edit: Actually, is this even necessary? I don't think it should be... (well, the ACTUpdateAnchorNodeAndViewOffset call might need the delay)
		//setTimeout(()=>FocusOnNodes(mapID, paths), 100);
		//return;
		await SleepAsync(1);
		doScroll();
	})();

	return <></>;
});

function ScrollToPosition_Center(scrollEl: HTMLElement, posInContainer: Vector2) {
	const scrollContainerViewportSize = new Vector2(scrollEl.getBoundingClientRect().width, scrollEl.getBoundingClientRect().height);
	//const topBarsHeight = window.innerHeight - scrollContainerViewportSize.y;

	//const oldScroll = GetScroll(scrollEl);
	const newScroll = new Vector2(
		posInContainer.x - (scrollContainerViewportSize.x / 2),
		posInContainer.y - (scrollContainerViewportSize.y / 2),
		// scroll down a bit extra, such that node is center of window, not center of scroll-view container/viewport (I've tried both, and this way is more centered "perceptually")
		//(posInContainer.y - (scrollContainerViewportSize.y / 2)) + (topBarsHeight / 2),
	);
	//console.log("Loading scroll:", newScroll.toString());
	SetScroll(scrollEl, newScroll);
}
export const GetScroll = (scrollEl: HTMLElement)=>new Vector2(scrollEl.scrollLeft, scrollEl.scrollTop);
export const SetScroll = (scrollEl: HTMLElement, scroll: Vector2)=>{ scrollEl.scrollLeft = scroll.x; scrollEl.scrollTop = scroll.y; };

export function InterpolateRect(rectA: VRect, rectB: VRect, percent: number) {
	return new VRect(
		Lerp(rectA.x, rectB.x, percent),
		Lerp(rectA.y, rectB.y, percent),
		Lerp(rectA.width, rectB.width, percent),
		Lerp(rectA.height, rectB.height, percent),
	);
}