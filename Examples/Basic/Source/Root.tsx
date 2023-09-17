import {Assert, CE, E, SleepAsync, Vector2, VRect} from "js-vextensions";
import {observable} from "mobx";
import {observer} from "mobx-react";
import React, {createContext, useCallback, useContext, useMemo, useState} from "react";
import {Button, Column, Text, Row, Spinner, TimeSpanInput} from "react-vcomponents";
import {n} from "react-vcomponents/Dist/@Types.js";
import {GetDOM} from "react-vextensions";
import {ConnectorLinesUI, Graph, GraphColumnsVisualizer, GraphContext, makeObservable_safe, SpaceTakerUI} from "tree-grapher";
import {FlashComp, FlashOptions} from "ui-debug-kit";
import {GetAllNodesInTree_ByNodePath, GetFocusNodePaths, GetNodeIDFromNodePath, GetNodeStateFromKeyframes, nodeTree_main} from "./@SharedByExamples/NodeData";
import {store} from "./Store";
import {NodeUI} from "./UI/NodeUI";

// make some stuff global, for easy debugging
Object.assign(globalThis, {
	Graph,
});

export class MapInfo {
	constructor() {
		makeObservable_safe(this, {
			nodeStates: observable,
		});
	}
	nodeStates = new Map<string, NodeState>(); // @O
	GetNodeState(path: string, allowKeyframeOverride = true) {
		if (!this.nodeStates.has(path)) {
			this.nodeStates.set(path, new NodeState());
		}
		let result = this.nodeStates.get(path)!;

		if (allowKeyframeOverride && urlOpts.anim) {
			const nodeID = GetNodeIDFromNodePath(path);
			/*const nodeID = GetNodeIDFromTreePath(path);
			Assert(nodeID, "NodeID could not be found from tree-path!");*/
			result = GetNodeStateFromKeyframes(nodeID);
		}

		return result;
	}
}
export class NodeState {
	constructor() {
		makeObservable_safe(this, {
			expanded: observable,
			focused: observable,
		});
	}
	expanded = false; // @O
	focused = false; // @O
}

export const MapContext = createContext<MapInfo>(undefined as any);

// flash option defaults
FlashOptions.defaults.waitForPriorFlashes = false;
FlashOptions.defaults.background = "rgba(0,0,0,.1)";
// debug mode
/*SetDebugMode(true);
/*FlashOptions.defaults.duration = -1;
FlashOptions.defaults.fadeDuration = -1;*#/
FlashOptions.finalizers.push(new FinalizerEntry({
	func: opts=>{
		opts.recordStackTrace = true;
		opts.duration = -1; // show persistingly
		opts.fadeDuration = 5; // but have fade in 5s

		// during highlighted period
		opts.background = "rgba(0,0,0,.7)";
		opts.pseudoEl_extraStyles = `
			white-space: pre;
		`;

		// during fade period
		if (opts.color.startsWith("hsla(")) {
			const valsArrayStr = opts.color.slice(opts.color.indexOf("(") + 1, opts.color.indexOf(")"));
			const vals = valsArrayStr.split(",").map(a=>a.trim());
			const newAlpha = Number(vals[3]) * .7;
			opts.fadeOverrides = {
				background: "rgba(0,0,0,.1)",
				color: `hsla(${vals[0]},${vals[1]},${vals[2]},${newAlpha})`,
				pseudoEl_extraStyles: `
					z-index: 99;
					white-space: pre;
				`,
			};
		}
	},
}));*/

export function GetURLOptions() {
	const urlParams = new URLSearchParams(window.location.search);
	const anim = urlParams.get("anim") == "1";
	const nodeSpacing = urlParams.get("nodeSpacing") ? Number(urlParams.get("nodeSpacing")) : anim ? 100 : 10;
	return {
		anim,
		nodeSpacing,
	};
}
export const urlOpts = GetURLOptions();

export const RootUI = observer(function RootUI() {
	const nodeTree = nodeTree_main;
	const mapInfo = useMemo(()=>{
		const result = new MapInfo();
		// for demo
		for (const [path, node] of GetAllNodesInTree_ByNodePath(nodeTree)) {
			result.GetNodeState(path).expanded = node.expanded ?? false;
			result.GetNodeState(path).focused = node.focused ?? false;
		}
		return result;
	}, [nodeTree]);
	//const containerRef = useRef<HTMLDivElement | null>(null);
	const graphInfo = useMemo(()=>{
		const graph = new Graph({
			//columnWidth: 100,
			uiDebugKit: {FlashComp},
			layoutOpts: {
				//containerPadding: {left: 100, top: 100, right: 100, bottom: 100},
				nodeSpacing: ()=>GetURLOptions().nodeSpacing,
				styleSetter_layoutPending: style=>{
					//style.right = "100%"; // alternative (not quite as "reliable", since sometimes user code might depend on knowing the correct ui position right away)
					style.opacity = "0";
					style.pointerEvents = "none";
				},
				styleSetter_layoutDone: style=>{
					//style.right = "";
					style.opacity = "";
					style.pointerEvents = "";
				},
			},
			getScrollElFromContainerEl: containerEl=>containerEl.parentElement?.parentElement!,
		});
		globalThis.graph = graph;
		return graph;
	}, []);

	// update some graph info
	const paddingAmount = urlOpts.anim ? 1000 : 100;
	graphInfo.containerPadding = {left: paddingAmount, top: paddingAmount, right: paddingAmount, bottom: paddingAmount};

	const [containerElResolved, setContainerElResolved] = useState(false);

	return (
		<Column style={{height: "100%"}}>
			<Toolbar/>
			<div style={{position: "relative", height: "calc(100% - 30px)", overflow: "auto"}}>
				<div style={E(
					{position: "relative", minWidth: "fit-content", minHeight: "fit-content"} as const,
				)}>
					<SpaceTakerUI graph={graphInfo} scaling={store.zoomLevel}/>
					<div style={E(
						//{position: "relative", width: "fit-content", height: "fit-content"} as const,
						{
							position: "absolute", left: 0, top: 0,
							width: CE(1 / store.zoomLevel).ToPercentStr(), height: CE(1 / store.zoomLevel).ToPercentStr(),
							///* display: "flex", */ whiteSpace: "nowrap",
							alignItems: "center",
						} as const,
						//mapState.zoomLevel != 1 && {zoom: mapState.zoomLevel.ToPercentStr()},
						store.zoomLevel != 1 && {
							transform: `scale(${CE(store.zoomLevel).ToPercentStr()})`,
							transformOrigin: "0% 0%",
						} as const,
					)}
						ref={useCallback(c=>{
							/*containerRef.current = GetDOM(c) as any;
							context.containerEl = containerRef.current!;*/
							graphInfo.containerEl = GetDOM(c) as any;
							if (graphInfo.containerEl != null) setContainerElResolved(true);
							//console.log("Set1:", context.containerEl);
						}, [graphInfo])}
					>
						{containerElResolved &&
						<MapContext.Provider value={mapInfo}>
							<GraphContext.Provider value={graphInfo}>
								<GraphColumnsVisualizer levelsToScrollContainer={3} zoomLevel={store.zoomLevel}/>
								<ConnectorLinesUI/>
								<NodeUI node={nodeTree} nodePath={nodeTree.id} treePath="0"/>
								<MapScroller graph={graphInfo}/>
							</GraphContext.Provider>
						</MapContext.Provider>}
					</div>
				</div>
			</div>
		</Column>
	);
});

const Toolbar = observer(()=>{
	const ChangeZoom = (newZoom: number)=>{
		store.zoomLevel = newZoom;
		// todo: preserve current view-center (see dm-repo)
	};

	return (
		<Row style={{
			height: 30,
			background: "rgba(0,0,0,.3)",
			border: "solid black", borderWidth: "0 0 1px 0",
		}}>
			<Button text="Base" onClick={()=>window.location.href = "http://localhost:8080"}/>
			<Button ml={5} text="Anim" onClick={()=>window.location.href = "http://localhost:8080/?anim=1"}/>

			{urlOpts.anim &&
			<Row ml={10}>
				<Button text={store.playing ? "⏸" : "▶"} onClick={()=>store.playing = !store.playing}/>
				<Spinner style={{width: 45}} instant={true} min={0} max={10} step={.1} value={store.speed} onChange={val=>store.speed = val}/>
				<TimeSpanInput largeUnit="minute" smallUnit="second" style={{width: 60}} value={store.targetTime ?? 0} onChange={val=>store.SetTargetTime(val)}/>
				<Text ml={3} title="With mouse over button, mouse scroll-wheel moves forward/backward by X frames.">Seek:</Text>
				<Button text="±1" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(1)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 1)}/>
				<Button text="±5" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(5)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 5)}/>
				<Button text="±20" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(20)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 20)}/>
				<Button text="±60" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(60)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 60)}/>
			</Row>}
			<Row center ml="auto">
				<Text>Zoom:</Text>
				<Spinner ml={3} style={{width: 45}} instant={true} min={.1} max={10} step={.1} value={store.zoomLevel} onChange={val=>ChangeZoom(val)}/>
				<Button ml={3} p="3px 10px" text="-" enabled={store.zoomLevel > .1} onClick={()=>ChangeZoom(CE((store.zoomLevel - .1)).RoundTo(.1))}/>
				<Button ml={3} p="3px 10px" text="+" enabled={store.zoomLevel < 10} onClick={()=>ChangeZoom(CE((store.zoomLevel + .1)).RoundTo(.1))}/>
			</Row>
		</Row>
	);
});

//let ignoreNextZoomChange = false;
const MapScroller = observer(function MapScroller(props: {graph: Graph}) {
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
	const focusNodePaths = GetFocusNodePaths(mapInfo);

	let focusNodeRectsMerged: VRect|n;
	for (const group of graph.groupsByPath.values()) {
		const groupNodePath = group.leftColumn_userData?.["nodePath"] as string;
		if (focusNodePaths.includes(groupNodePath) && group.InnerUIRect) {
			focusNodeRectsMerged = focusNodeRectsMerged ? focusNodeRectsMerged.Encapsulating(group.InnerUIRect) : group.InnerUIRect;
		}
	}
	if (focusNodeRectsMerged == null) return null;

	//const nodeBoxesMerged_sizeWhenUnscaled = focusNodeRectsMerged.Size.DividedBy(store.zoomLevel);
	const nodeBoxesMerged_sizeWhenUnscaled = focusNodeRectsMerged.Size;

	const viewportSize = new Vector2(scrollEl.clientWidth, scrollEl.clientHeight);
	// apply just enough zoom-out to be able to fit all of the focus-nodes within the viewport
	const zoomRequired = Math.min(viewportSize.x / nodeBoxesMerged_sizeWhenUnscaled.x, viewportSize.y / nodeBoxesMerged_sizeWhenUnscaled.y);
	const newZoom = CE(CE(zoomRequired * .9).FloorTo(.1)).KeepBetween(.1, 1);

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

	function doScroll() { ScrollToPosition_Center(scrollEl!, focusNodeRectsMerged!.Center.Times(store.zoomLevel)); }
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