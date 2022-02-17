import {CE} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useContext} from "react";
import {Button, Column, Row, Text} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {useForceUpdate} from "tree-grapher";
import {MapNode} from "../@SharedByExamples/MapNode";
import {MapContext} from "../Root";

export const textRepeatSplitter = " [x2:] ";
export type PeersChangerFunc = (peers: MapNode[])=>MapNode[];
export type ChangePeersOrderFunc = (func: PeersChangerFunc)=>void;
export const NodeUI_Inner = observer((props: {node: MapNode, path: string, inBelowGroup?: boolean, changePeersOrder?: ChangePeersOrderFunc})=>{
	const {node, path, inBelowGroup, changePeersOrder} = props;
	const mapInfo = useContext(MapContext);
	const nodeState = mapInfo.GetNodeState(path);
	const forceUpdate = useForceUpdate();

	const textIsRepeated = node.text.includes(textRepeatSplitter);

	return (
		<Row style={{
			background: "rgba(100,100,100,.7)",
			border: "1px solid black",
			borderRadius: 10,
			width: node.width + (inBelowGroup ? -20 : 0), // if in below group, reduce width by 20, to make space for bar at left of group
			//margin: "5px 0",
			padding: 5,
		}}>
			<Text>{node.text}</Text>
			<Row ml="auto">
				<Column>
					<Button p={5} text={"↑"} enabled={changePeersOrder != null} onClick={()=>{
						changePeersOrder!(peers=>{
							const result = peers.slice();
							const oldIndex = result.indexOf(node);
							CE(result).Move(node, oldIndex - 1);
							return result;
						});
					}}/>
					<Button p={5} text={"↓"} enabled={changePeersOrder != null} onClick={()=>{
						changePeersOrder!(peers=>{
							const result = peers.slice();
							const oldIndex = result.indexOf(node);
							CE(result).Move(node, oldIndex + 1, true);
							return result;
						});
					}}/>
				</Column>
				<Column>
					<Button p={5} text={"←"} onClick={()=>{
						node.width -= 50;
						forceUpdate();
					}}/>
					<Button p={5} text={textIsRepeated ? "x1" : "x3"} onClick={()=>{
						if (textIsRepeated) {
							node.text = node.text.split(textRepeatSplitter)[0];
						} else {
							node.text = node.text + textRepeatSplitter + node.text + textRepeatSplitter + node.text;
						}
						forceUpdate();
					}}/>
				</Column>
				<Column>
					<Button p={5} text={"→"} onClick={()=>{
						node.width += 50;
						forceUpdate();
					}}/>
					<Button p="5px 10px" text={nodeState.expanded ? "-" : "+"} onClick={()=>{
						nodeState.expanded = !nodeState.expanded;
					}}/>
				</Column>
			</Row>
		</Row>
	);
});