import {observer} from "mobx-react";
import React, {useContext} from "react";
import {Button, Column, Row, Text} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {useForceUpdate} from "../@SharedByExamples/Utils/General";
import {MapContext} from "../Root";

export const textDoubleSplitter = " [x2:] ";
export const NodeUI_Inner = observer((props: {node: MapNode, path: string})=>{
	let {node, path} = props;
	const mapInfo = useContext(MapContext);
	const nodeState = mapInfo.GetNodeState(path);
	const forceUpdate = useForceUpdate();
	
	const textIsDoubled = node.text.includes(textDoubleSplitter);
	
	return (
		<Row style={{
			background: "rgba(100,100,100,.7)",
			border: "1px solid black",
			borderRadius: 10,
			width: node.width,
			padding: 5,
		}}>
			<Text>{node.text}</Text>
			<Button ml="auto" p={5} text={textIsDoubled ? "x1" : "x2"} onClick={()=>{
				if (textIsDoubled) {
					node.text = node.text.split(textDoubleSplitter)[0];
				} else {
					node.text = node.text + textDoubleSplitter + node.text;
				}
				forceUpdate();
			}}/>
			<Button p="5px 10px" text={nodeState.expanded ? "-" : "+"} onClick={()=>{
				nodeState.expanded = !nodeState.expanded;
			}}/>
		</Row>
	);
});