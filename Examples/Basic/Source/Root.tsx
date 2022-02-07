import React, {createContext, useMemo} from "react";
import {BaseComponent} from "react-vextensions";
import {Column, Row} from "react-vcomponents";
import {NodeUI} from "./UI/NodeUI";
import {GetAllNodesInTree_ByPath, nodeTree_main} from "./@SharedByExamples/NodeData";
import {Graph, GraphContext, makeObservable_safe} from "tree-grapher";
import {GraphColumnsVisualizer} from "./UI/GraphColumnsVisualizer";
import {makeObservable, observable} from "mobx";

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
	const context = useMemo(()=>{
		let graph = new Graph({columnWidth: 100});
		globalThis.graph = graph;
		return graph;
	}, []);

	return (
		<Column style={{height: "100%"}}>
			<Row style={{
				height: 30,
				background: "rgba(0,0,0,.3)",
				border: "solid black", borderWidth: "0 0 1px 0",
			}}>
				Toolbar
			</Row>
			<Row style={{position: "relative", height: "calc(100% - 30px)", padding: 100}}>
				<MapContext.Provider value={mapInfo}>
					<GraphContext.Provider value={context}>
						<GraphColumnsVisualizer/>
						<NodeUI node={nodeTree} path="0"/>
					</GraphContext.Provider>
				</MapContext.Provider>
			</Row>
		</Column>
	);
}