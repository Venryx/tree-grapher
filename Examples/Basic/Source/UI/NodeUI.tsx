import {observer} from "mobx-react";
import React, {useCallback, useContext, useState} from "react";
import {Column} from "react-vcomponents";
import {NodeUI_LeftColumn} from "tree-grapher";
import {useStateWithDeps} from "use-state-with-deps";
import {MapNode} from "../@SharedByExamples/MapNode";
import {MapContext} from "../Root";
import {ChangePeersOrderFunc, NodeUI_Inner} from "./NodeUI_Inner";

export const NodeUI = observer((props: {node: MapNode, path: string, inBelowGroup?: boolean, changePeersOrder?: ChangePeersOrderFunc})=>{
	const {node, path, inBelowGroup, changePeersOrder} = props;
	const mapInfo = useContext(MapContext);
	//const graph = useContext(GraphContext);
	//const group = graph.groupsByPath.get(path);
	const nodeState = mapInfo.GetNodeState(path);

	//const forceUpdate = useForceUpdate();
	const [children, setChildren] = useStateWithDeps(node.children, [node]);

	const changePeersOrder_forChildren = useCallback(peerChangerFunc=>{
		const newChildren = peerChangerFunc(children);
		setChildren(newChildren);
	}, [children, setChildren]);
	return (
		<>
			<NodeUI_LeftColumn treePath={path} alignWithParent={node.alignWithParent} nodeConnectorOpts={{gutterWidth: inBelowGroup ? 20 : 30, parentGutterWidth: 30, parentIsAbove: inBelowGroup, color: path.split("/").length % 2 == 0 ? "green" : "blue"}}>
				<NodeUI_Inner node={node} path={path} inBelowGroup={inBelowGroup} changePeersOrder={changePeersOrder}/>
			</NodeUI_LeftColumn>
			{nodeState.expanded &&
			children.map((child, index)=>{
				return <NodeUI key={index} node={child} inBelowGroup={node.childrenBelow} path={`${path}/${index}`} changePeersOrder={changePeersOrder_forChildren}/>;
			})}
		</>
	);
});

export function NodeUI_RightColumn(props: {treePath: string, children}) {
	const {children} = props;
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