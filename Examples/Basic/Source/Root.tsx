import {observable} from "mobx";
import React, {createContext, useCallback, useMemo, useState} from "react";
import {Column, Row} from "react-vcomponents";
import {GetDOM} from "react-vextensions";
import {ConnectorLinesUI, Graph, GraphColumnsVisualizer, GraphContext, makeObservable_safe} from "tree-grapher";
import {FlashComp, FlashOptions} from "ui-debug-kit";
import {GetAllNodesInTree_ByPath, nodeTree_main} from "./@SharedByExamples/NodeData";
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
		const result = new MapInfo();
		// for demo
		for (const [path, node] of GetAllNodesInTree_ByPath(nodeTree)) {
			result.GetNodeState(path).expanded = node.expanded ?? false;
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
				nodeSpacing: ()=>10,
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
	graphInfo.containerPadding = {left: 100, top: 100, right: 100, bottom: 100};

	const [containerElResolved, setContainerElResolved] = useState(false);

	return (
		<Column style={{height: "100%"}}>
			<Row style={{
				height: 30,
				background: "rgba(0,0,0,.3)",
				border: "solid black", borderWidth: "0 0 1px 0",
			}}>
				Toolbar
			</Row>
			<div style={{position: "relative", height: "calc(100% - 30px)", overflow: "auto"}}>
				<div
					ref={useCallback(c=>{
						/*containerRef.current = GetDOM(c) as any;
						context.containerEl = containerRef.current!;*/
						graphInfo.containerEl = GetDOM(c) as any;
						if (graphInfo.containerEl != null) setContainerElResolved(true);
						//console.log("Set1:", context.containerEl);
					}, [graphInfo])}
					//style={{padding: 100}}
				>
					{containerElResolved &&
					<MapContext.Provider value={mapInfo}>
						<GraphContext.Provider value={graphInfo}>
							<GraphColumnsVisualizer/>
							<ConnectorLinesUI/>
							<NodeUI node={nodeTree} path="0"/>
						</GraphContext.Provider>
					</MapContext.Provider>}
				</div>
			</div>
		</Column>
	);
}