import {observer} from "mobx-react";
import React, {useCallback, useContext} from "react";
import {Column} from "react-vcomponents";
import {NodeUI_LeftColumn} from "tree-grapher";
import {useStateWithDeps} from "use-state-with-deps";
import {MapNode} from "../@SharedByExamples/MapNode";
import {GetNodeStateFromKeyframes} from "../@SharedByExamples/NodeData.js";
import {MapContext, urlOpts} from "../Root";
import {ChangePeersOrderFunc, NodeUI_Inner} from "./NodeUI_Inner";

// eslint-disable-next-line prefer-arrow-callback
export const NodeUI = observer(function NodeUI(props: {node: MapNode, nodePath: string, treePath: string, inBelowGroup?: boolean, forLayoutHelper: boolean, changePeersOrder?: ChangePeersOrderFunc}) {
	const {node, nodePath, treePath, inBelowGroup, forLayoutHelper, changePeersOrder} = props;
	const mapInfo = useContext(MapContext);
	//const graph = useContext(GraphContext);
	//const group = graph.groupsByPath.get(path);
	const nodeState = mapInfo.GetNodeState(nodePath);
	const expanded_final = nodeState.expanded || forLayoutHelper;

	//const forceUpdate = useForceUpdate();
	const [children, setChildren] = useStateWithDeps(node.children, [node]);

	const changePeersOrder_forChildren = useCallback(peerChangerFunc=>{
		const newChildren = peerChangerFunc(children);
		setChildren(newChildren);
	}, [children, setChildren]);
	return (
		<>
			<NodeUI_LeftColumn treePath={treePath} alignWithParent={node.alignWithParent} userData={{nodePath}} nodeConnectorOpts={{
				gutterWidth: inBelowGroup ? 20 : 30, parentGutterWidth: 30, parentIsAbove: inBelowGroup, color: treePath.split("/").length % 2 == 0 ? "green" : "blue",
			}}>
				<NodeUI_Inner node={node} nodePath={nodePath} treePath={treePath} inBelowGroup={inBelowGroup} forLayoutHelper={forLayoutHelper} changePeersOrder={changePeersOrder}/>
			</NodeUI_LeftColumn>
			{expanded_final &&
			children.map((child, index)=>{
				return <NodeUI key={index} node={child} inBelowGroup={node.childrenBelow} nodePath={`${nodePath}/${child.id}`} treePath={`${treePath}/${index}`} forLayoutHelper={forLayoutHelper} changePeersOrder={changePeersOrder_forChildren}/>;
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