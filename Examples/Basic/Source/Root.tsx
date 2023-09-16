import {Assert, CE} from "js-vextensions";
import {observable} from "mobx";
import {observer} from "mobx-react";
import React, {createContext, useCallback, useMemo, useState} from "react";
import {Button, Column, Text, Row, Spinner, TimeSpanInput} from "react-vcomponents";
import {GetDOM} from "react-vextensions";
import {ConnectorLinesUI, Graph, GraphColumnsVisualizer, GraphContext, makeObservable_safe, SpaceTakerUI} from "tree-grapher";
import {FlashComp, FlashOptions} from "ui-debug-kit";
import {GetAllNodesInTree_ByNodePath, GetNodeIDFromNodePath, GetNodeStateFromKeyframes, nodeTree_main} from "./@SharedByExamples/NodeData";
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

export function RootUI() {
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
				<div style={{position: "relative", width: "fit-content", height: "fit-content"}}
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
							<SpaceTakerUI graph={graphInfo} scaling={store.zoomLevel}/>
							<GraphColumnsVisualizer/>
							<ConnectorLinesUI/>
							<NodeUI node={nodeTree} nodePath={nodeTree.id} treePath="0"/>
						</GraphContext.Provider>
					</MapContext.Provider>}
				</div>
			</div>
		</Column>
	);
}

const Toolbar = observer(()=>{
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
		</Row>
	);
});