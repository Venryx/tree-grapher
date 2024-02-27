import {CE, E, Timer} from "js-vextensions";
import {makeObservable, observable, runInAction} from "mobx";
import {observer} from "mobx-react";
import React, {createContext, useMemo} from "react";
import {Button, CheckBox, Column, Row, Spinner, Text, TimeSpanInput} from "react-vcomponents";
import {Graph, makeObservable_safe} from "tree-grapher";
import {FlashOptions} from "ui-debug-kit";
import {GetNodeIDFromNodePath, GetNodeStateFromKeyframes} from "./@SharedByExamples/NodeData";
import {store} from "./Store";
import {useGraph} from "./UI/MapGraph.js";
import {MapUI} from "./UI/MapUI.js";

// make some stuff global, for easy debugging
Object.assign(globalThis, {
	Graph,
});

export class MapInfo {
	constructor() {
		makeObservable_safe(this, {
			allowKeyframeOverride: observable,
			nodeStates: observable,
		});
	}
	allowKeyframeOverride = true; // @O
	nodeStates = new Map<string, NodeState>(); // @O
	GetNodeState(path: string, allowKeyframeOverride = true, targetTime = store.targetTime) {
		if (!this.nodeStates.has(path)) {
			this.nodeStates.set(path, new NodeState());
		}
		let result = this.nodeStates.get(path)!;

		if (this.allowKeyframeOverride && allowKeyframeOverride && urlOpts.anim) {
			const nodeID = GetNodeIDFromNodePath(path);
			/*const nodeID = GetNodeIDFromTreePath(path);
			Assert(nodeID, "NodeID could not be found from tree-path!");*/
			result = GetNodeStateFromKeyframes(nodeID, targetTime);
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
	const stable = urlParams.get("stable") == "1";
	const nodeSpacing = urlParams.get("nodeSpacing") ? Number(urlParams.get("nodeSpacing")) : anim ? 100 : 10;
	return {
		anim,
		stable,
		nodeSpacing,
	};
}
export const urlOpts = GetURLOptions();

export const RootUI = observer(function RootUI_() {
	//const containerRef = useRef<HTMLDivElement | null>(null);
	const graph_layoutHelper = useGraph(true, null);
	const graph_main = useGraph(false, graph_layoutHelper);

	// update some graph info
	const paddingAmount = urlOpts.anim || urlOpts.stable ? 1000 : 100;
	graph_main.containerPadding = {left: paddingAmount, top: paddingAmount, right: paddingAmount, bottom: paddingAmount};
	graph_layoutHelper.containerPadding = {left: paddingAmount, top: paddingAmount, right: paddingAmount, bottom: paddingAmount};

	return (
		<Column style={{position: "relative", height: "100%", userSelect: "none"}}>
			<Toolbar/>
			<MapUI mainGraph={graph_main} mainGraphIsLayoutHelper={false} layoutHelperGraph={graph_layoutHelper}/>
			<div
				className={
					[!store.layoutHelper_show && "hideAndCompletelyBlockMouseEvents"].filter(a=>a).join(" ")
				}
				style={E(
					{position: "absolute", left: 0, top: 30, right: 0, bottom: 0 /*zIndex: 1*/} as const,
				)}>
				<style>{`
				.hideAndCompletelyBlockMouseEvents { opacity: 0 !important; pointer-events: none !important; }
				.hideAndCompletelyBlockMouseEvents * { opacity: 0 !important; pointer-events: none !important; }
				`}</style>
				<MapUI mainGraph={graph_layoutHelper} mainGraphIsLayoutHelper={true}/>
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
			<Button ml={5} text="Stable expand" onClick={()=>window.location.href = "http://localhost:8080/?stable=1"}/>

			{urlOpts.anim &&
			<Row ml={10}>
				<Button text={store.framePlayer.playing ? "⏸" : "▶"} onClick={()=>store.framePlayer.SetPlaying(!store.framePlayer.playing)}/>
				<Spinner style={{width: 45}} instant={true} min={0} max={10} step={.1} value={store.framePlayer.speed} onChange={val=>store.framePlayer.SetSpeed(val)}/>
				<TimeSpanInput largeUnit="minute" smallUnit="second" style={{width: 60}} value={store.targetTime ?? 0} onChange={val=>store.SetTargetTime(val)}/>
				<Text ml={3} title="With mouse over button, mouse scroll-wheel moves forward/backward by X frames.">Seek:</Text>
				<Button text="±1" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(1)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 1)}/>
				<Button text="±5" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(5)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 5)}/>
				<Button text="±20" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(20)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 20)}/>
				<Button text="±60" ml={3} p={5} onClick={()=>store.AdjustTargetTimeByFrames(60)} onWheel={e=>store.AdjustTargetTimeByFrames(Math.sign(e.deltaY) * 60)}/>
			</Row>}
			<Row center ml="auto">
				<CheckBox text="Show layout-helper map" value={store.layoutHelper_show} onChange={val=>store.layoutHelper_show = val}/>
				<Text ml={5}>Zoom:</Text>
				<Spinner ml={3} style={{width: 45}} instant={true} min={.1} max={10} step={.1} value={store.zoomLevel} onChange={val=>ChangeZoom(val)}/>
				<Button ml={3} p="3px 10px" text="-" enabled={store.zoomLevel > .1} onClick={()=>ChangeZoom(CE((store.zoomLevel - .1)).RoundTo(.1))}/>
				<Button ml={3} p="3px 10px" text="+" enabled={store.zoomLevel < 10} onClick={()=>ChangeZoom(CE((store.zoomLevel + .1)).RoundTo(.1))}/>
			</Row>
		</Row>
	);
});
