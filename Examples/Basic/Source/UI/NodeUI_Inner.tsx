import {observer} from "mobx-react";
import React, {useContext} from "react";
import {Button, Column, Row, Text} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {MapContext} from "../Root";

export const NodeUI_Inner = observer((props: {node: MapNode, path: string})=>{
	let {node, path} = props;
	const mapInfo = useContext(MapContext);
	const nodeState = mapInfo.GetNodeState(path);
	
	return (
		<Row style={{
			background: "rgba(100,100,100,.7)",
			border: "1px solid black",
			borderRadius: 10,
			width: node.width,
			padding: 5,
		}}>
			<Text>{node.text}</Text>
			<Button text={nodeState.expanded ? "-" : "+"} onClick={()=>{
				nodeState.expanded = !nodeState.expanded;
			}}/>
		</Row>
	);
});