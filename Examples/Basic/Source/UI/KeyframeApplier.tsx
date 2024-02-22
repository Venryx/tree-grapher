import {CE, Lerp, SleepAsync, Vector2, VRect} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useContext} from "react";
import {n} from "react-vcomponents/Dist/@Types.js";
import {Graph, NodeGroup, FlexNode, GetTreeNodeBaseRect, GetTreeNodeOffset} from "tree-grapher";
import {GetFocusNodePaths, GetVisibleNodePaths, keyframes} from "../@SharedByExamples/NodeData";
import {store} from "../Store";
import {MapContext, MapInfo} from "../Root.js";
import {GetPercentThroughTransition} from "./MapGraph.js";

export const GetLastKeyframe = ()=>{
	return keyframes.findLast(a=>a.time <= store.targetTime);
};
export const GetNextKeyframe = ()=>{
	return keyframes.find(a=>a.time > store.targetTime);
};

//let ignoreNextZoomChange = false;
export const KeyframeApplier = observer(function KeyframeApplier_(props: {mainGraph: Graph, layoutHelperGraph: Graph|n}) {
	const {mainGraph, layoutHelperGraph} = props;
	if (mainGraph.containerEl == null) return null;
	const scrollEl = mainGraph.getScrollElFromContainerEl(mainGraph.containerEl);
	if (scrollEl == null) return null;
	//const zoomLevel = store.zoomLevel;
	/*if (ignoreNextZoomChange) {
		ignoreNextZoomChange = false;
		return null;
	}*/

	const mapInfo = useContext(MapContext);
	const lastKeyframe = GetLastKeyframe();
	const nextKeyframe = GetNextKeyframe();
	if (lastKeyframe == null || nextKeyframe == null) return null;
	const lastFocusNodePaths = GetFocusNodePaths(mapInfo, store.targetTime);
	const nextFocusNodePaths = GetFocusNodePaths(mapInfo, nextKeyframe.time);

	const lastKeyframe_groupRects = GetGroupRectsAtKeyframe(mapInfo, mainGraph, layoutHelperGraph, lastKeyframe.time);
	const nextKeyframe_groupRects = GetGroupRectsAtKeyframe(mapInfo, mainGraph, layoutHelperGraph, nextKeyframe.time);
	if (lastKeyframe_groupRects == null || nextKeyframe_groupRects == null) return null;

	const MergeNodeRects = (nodePaths: string[], groupRectsAtTargetTime: Map<string, VRect>)=>{
		let nodeRectsMerged: VRect|n;
		/*for (const group of mainGraph.groupsByPath.values()) {
			const groupNodePath = group.leftColumn_userData?.["nodePath"] as string;
			const groupRect = groupRectsAtTargetTime.get(group.path);
			if (nodePaths.includes(groupNodePath) && groupRect) {
				nodeRectsMerged = nodeRectsMerged ? nodeRectsMerged.Encapsulating(groupRect) : groupRect;
			}
		}*/
		for (const [nodePath, rect] of groupRectsAtTargetTime) {
			if (nodePaths.includes(nodePath) && rect) {
				nodeRectsMerged = nodeRectsMerged ? nodeRectsMerged.Encapsulating(rect) : rect;
			}
		}
		return nodeRectsMerged;
	};
	const lastFocusNodeRectsMerged = MergeNodeRects(lastFocusNodePaths, lastKeyframe_groupRects);
	const nextFocusNodeRectsMerged = MergeNodeRects(nextFocusNodePaths, nextKeyframe_groupRects);
	if (lastFocusNodeRectsMerged == null || nextFocusNodeRectsMerged == null) return null;
	//const percentFromLastToNext = (store.targetTime - lastKeyframe.time) / (nextKeyframe.time - lastKeyframe.time);
	const percentFromLastToNext = GetPercentThroughTransition(lastKeyframe, nextKeyframe);
	const focusNodeRects_interpolated = InterpolateRect(lastFocusNodeRectsMerged, nextFocusNodeRectsMerged, percentFromLastToNext);
	//console.log("percentFromLastToNext:", percentFromLastToNext);

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
	console.log("Loading scroll:", newScroll.toString());
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

export function GetGroupRectsAtKeyframe(mapInfo: MapInfo, mainGraph: Graph, layoutHelperGraph: Graph|n, keyframeTime: number) {
	//return CE([...mainGraph.groupsByPath.entries()]).ToMap(a=>a[0], a=>a[1].InnerUIRect!);

	const nodesVisibleAtKeyframe = GetVisibleNodePaths(mapInfo, keyframeTime);
	
	let tree: FlexNode<NodeGroup>;
	if (layoutHelperGraph != null) {
		tree = layoutHelperGraph.GetLayout(undefined, group=>{
			//return mainGraph.groupsByPath.has(group.path);
			return nodesVisibleAtKeyframe.includes(group.leftColumn_userData?.["nodePath"] as string);
		})!;
	} else {
		tree = mainGraph.GetLayout()!;
		/*tree = mainGraph.GetLayout(undefined, group=>{
			return nodesVisibleAtKeyframe.includes(group.leftColumn_userData?.["nodePath"] as string);
		})!;*/
	}
	if (tree == null) return null;

	const treeNodes = tree.nodes; // This is a getter, and pretty expensive (at scale)! So cache its value here.
	const nodeRects_base: VRect[] = treeNodes.map(node=>GetTreeNodeBaseRect(node));
	const {offset} = GetTreeNodeOffset(nodeRects_base, treeNodes, mainGraph.containerPadding);
	const nodeRects_final = nodeRects_base.map(a=>a.NewPosition(b=>b.Plus(offset)));

	const groupRects = new Map<string, VRect>();
	for (const [i, treeNode] of treeNodes.entries()) {
		const nodePath = treeNode.data.leftColumn_userData?.["nodePath"] as string;
		groupRects.set(nodePath, nodeRects_final[i]);
	}
	return groupRects;
}