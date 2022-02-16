import React, {createContext, useCallback, useMemo, useRef, useState} from "react";
import {BaseComponent, GetDOM} from "react-vextensions";
import {Column, Row} from "react-vcomponents";
import {NodeUI} from "./UI/NodeUI";
import {GetAllNodesInTree_ByPath, nodeTree_main} from "./@SharedByExamples/NodeData";
import {FlexTreeLayout, Graph, GraphColumnsVisualizer, GraphContext, makeObservable_safe} from "tree-grapher";
import {makeObservable, observable} from "mobx";
import {FinalizerEntry, FlashComp, FlashOptions, MAX_TIMEOUT_DURATION, SetDebugMode} from "ui-debug-kit";
import {NodeGroup} from "../../../Dist/Graph/NodeGroup.js";
import {Vector2} from "js-vextensions";

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
	GetNodeState(path: string) {
		if (!this.nodeStates.has(path)) {
			this.nodeStates.set(path, new NodeState());
		}
		return this.nodeStates.get(path)!;
	}
}
export class NodeState {
	constructor() {
		makeObservable_safe(this, {
			expanded: observable,
		});
	}
	expanded = false; // @O
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

export function RootUI() {
	const nodeTree = nodeTree_main;
	const mapInfo = useMemo(()=>{
		let result = new MapInfo();
		// for demo
		for (const [path, node] of GetAllNodesInTree_ByPath(nodeTree)) {
			result.GetNodeState(path).expanded = node.expanded ?? false;
		}
		return result;
	}, []);
	//const containerRef = useRef<HTMLDivElement | null>(null);
	const graphInfo = useMemo(()=>{
		let graph = new Graph({
			columnWidth: 100,
			uiDebugKit: {FlashComp},
		});
		globalThis.graph = graph;
		return graph;
	}, []);
	
	let [containerElResolved, setContainerElResolved] = useState(false);

	return (
		<Column style={{height: "100%"}}>
			<Row style={{
				height: 30,
				background: "rgba(0,0,0,.3)",
				border: "solid black", borderWidth: "0 0 1px 0",
			}}>
				Toolbar
			</Row>
			<div
				ref={useCallback(c=>{
					/*containerRef.current = GetDOM(c) as any;
					context.containerEl = containerRef.current!;*/
					graphInfo.containerEl = GetDOM(c) as any;
					if (graphInfo.containerEl != null) setContainerElResolved(true);
					//console.log("Set1:", context.containerEl);
				}, [])}
				style={{position: "relative", height: "calc(100% - 30px)", padding: 100}}
			>
				{containerElResolved &&
				<MapContext.Provider value={mapInfo}>
					<GraphContext.Provider value={graphInfo}>
						<GraphColumnsVisualizer/>
						<NodeUI node={nodeTree} path="0"/>
					</GraphContext.Provider>
				</MapContext.Provider>}
			</div>
		</Column>
	);
}