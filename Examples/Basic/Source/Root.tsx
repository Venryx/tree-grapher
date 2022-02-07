import React, {useMemo} from "react";
import {BaseComponent} from "react-vextensions";
import {Column, Row} from "react-vcomponents";
import {NodeUI} from "./UI/NodeUI";
import {nodeTree_main} from "./@SharedByExamples/NodeData";
import {Graph, GraphContext} from "tree-grapher";
import {GraphColumnsVisualizer} from "./UI/GraphColumnsVisualizer";

// make some stuff global, for easy debugging
Object.assign(globalThis, {
	Graph,
});

export function RootUI() {
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
			<Row style={{position: "relative", height: "calc(100% - 30px)", padding: 50}}>
				<GraphContext.Provider value={context}>
					<GraphColumnsVisualizer/>
					<NodeUI node={nodeTree_main} treePath="0"/>
				</GraphContext.Provider>
			</Row>
		</Column>
	);
}