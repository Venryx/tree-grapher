import React, {Component, useContext} from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";
import {NodeUI_Inner} from "./NodeUI_Inner";
import {GraphContext, NodeUI_LeftColumn} from "tree-grapher";
import {observer} from "mobx-react";
import {MapContext} from "../Root";

export const NodeUI = observer((props: {node: MapNode, path: string, inBelowGroup?: boolean})=>{
	let {node, path, inBelowGroup} = props;
	const mapInfo = useContext(MapContext);
	//const graph = useContext(GraphContext);
	//const group = graph.groupsByPath.get(path);
	const nodeState = mapInfo.GetNodeState(path);
	
	const childHolder = <NodeChildHolder children={node.children} childrenBelow={node.childrenBelow} {...{path}}/>;
	return (
		<>
			<NodeUI_LeftColumn treePath={path} alignWithParent={node.alignWithParent} connectorLineOpts={{color: path.split("/").length % 2 == 0 ? "green" : "blue"}}>
				<NodeUI_Inner node={node} path={path} inBelowGroup={inBelowGroup}/>
			</NodeUI_LeftColumn>
			{nodeState.expanded &&
				childHolder}
		</>
	);
});

export function NodeUI_RightColumn(props: {treePath: string, children}) {
	let {children} = props;
	return (
		<Column className="rightColumn clickThrough"
			style={{
				position: "absolute", left: "100%",
				//top: rightColumnOffset,
				top: 0,
			}}
		>
			{children}
		</Column>
	);
}