import React, {useContext} from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";
import {NodeUI_Inner} from "./NodeUI_Inner";
import {NodeUI_LeftColumn, NodeUI_RightColumn} from "tree-grapher";
import {observer} from "mobx-react";
import {MapContext} from "../Root";

export const NodeUI = observer((props: {node: MapNode, path: string})=>{
	let {node, path} = props;
	const mapInfo = useContext(MapContext);
	const nodeState = mapInfo.GetNodeState(path);
	
	return (
		<Row className="NodeUI" style={Object.assign(
			{
				position: "relative",
				//background: StripesCSS({angle: 0, stripeColor: "rgba(255,0,0,.2)"}),
			},
			path == "0" && {alignSelf: "flex-start"}, // root node needs this, to not be stretched to fit container's height
		)}>
			<NodeUI_LeftColumn {...{treePath: path}}>
				<NodeUI_Inner node={node} path={path}/>
			</NodeUI_LeftColumn>
			{nodeState.expanded &&
			<NodeUI_RightColumn {...{treePath: path}}>
				<NodeChildHolder children={node.children} {...{path}}/>
			</NodeUI_RightColumn>}
		</Row>
	);
});