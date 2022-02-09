import React, {Component, useContext} from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";
import {NodeUI_Inner} from "./NodeUI_Inner";
import {NodeUI_LeftColumn} from "tree-grapher";
import {observer} from "mobx-react";
import {MapContext} from "../Root";

export const NodeUI = observer((props: {node: MapNode, path: string, inBelowGroup?: boolean})=>{
	let {node, path, inBelowGroup} = props;
	const mapInfo = useContext(MapContext);
	const nodeState = mapInfo.GetNodeState(path);
	
	const childHolder = <NodeChildHolder children={node.children} childrenBelow={node.childrenBelow} {...{path}}/>;
	return (
		<>
			<Row className="NodeUI clickThrough" style={Object.assign(
				{
					position: "relative",
					//background: StripesCSS({angle: 0, stripeColor: "rgba(255,0,0,.2)"}),
				},
				path == "0" && {alignSelf: "flex-start"}, // root node needs this, to not be stretched to fit container's height
			)}>
				<NodeUI_LeftColumn treePath={path} connectorLineOpts={{color: path.split("/").length % 2 == 0 ? "green" : "blue"}}>
					<NodeUI_Inner node={node} path={path} inBelowGroup={inBelowGroup}/>
				</NodeUI_LeftColumn>
				{nodeState.expanded && !node.childrenBelow &&
				<NodeUI_RightColumn treePath={path}>
					{childHolder}
				</NodeUI_RightColumn>}
			</Row>
			{nodeState.expanded && node.childrenBelow &&
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