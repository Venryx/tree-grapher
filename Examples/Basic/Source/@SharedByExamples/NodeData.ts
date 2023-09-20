import {CE, Clone} from "js-vextensions";
import {MapInfo, NodeState} from "../Root";
import {store} from "../Store";
import {MapNode} from "./MapNode";
import {RequiredBy} from "./Utils/General";

export type MapNodeWithState = Omit<MapNode, "children"> & {children: MapNodeWithState[], expanded?: boolean, focused?: boolean};
function NewNode(data: RequiredBy<Partial<MapNodeWithState>, "id">) {
	return new MapNode(data) as MapNodeWithState;
}

export class Keyframe {
	constructor(data?: Partial<Keyframe>) {
		Object.assign(this, data);
	}
	time: number;
	actions: {
		[key: string]: Action;
	};
}
export class Action {
	setExpanded?: boolean;
	setFocused?: boolean;
}

export const nodeTree_main = NewNode({id: "0", expanded: true, children: [
	NewNode({id: "0.0", expanded: true, children: [
		NewNode({id: "0.0.0", expanded: true}),
		NewNode({id: "0.0.1", expanded: false, children: [
			NewNode({id: "0.0.1.0", expanded: true}),
			NewNode({id: "0.0.1.1", expanded: true, children: [
				NewNode({id: "0.0.1.1.0", expanded: true}),
				NewNode({id: "0.0.1.1.1", expanded: true, alignWithParent: true}),
			]}),
			NewNode({id: "0.0.1.2", expanded: true, children: [
				NewNode({id: "0.0.1.2.0", expanded: true}),
				NewNode({id: "0.0.1.2.1", expanded: true, alignWithParent: true}),
			]}),
		]}),
	]}),
	NewNode({id: "0.1", expanded: true, children: [
		NewNode({id: "0.1.0", expanded: true, childrenBelow: true, children: [
			NewNode({id: "0.1.0.0", expanded: true, children: [
				NewNode({id: "0.1.0.0.1", expanded: true}),
			]}),
			NewNode({id: "0.1.0.1", expanded: true}),
		]}),
		NewNode({id: "0.1.1", expanded: true}),
	]}),
]});
export const nodeTree_main_orig = Clone(nodeTree_main);

export const keyframes: Keyframe[] = [
	// this line just replicates the initial state of the node-tree, as a keyframe (will probably use better system later)
	new Keyframe({time: 0, actions: {all: {setExpanded: true},
		"0.0.1": {setExpanded: false}}}),
	// these lines are the "actual keyframes"
	new Keyframe({time: 0, actions: {all: {setFocused: true}}}),
	new Keyframe({time: 1, actions: {all: {setFocused: false},
		"0.0": {setFocused: true}, "0.0.0": {setFocused: true}, "0.0.1": {setFocused: true}}}),
	new Keyframe({time: 2, actions: {all: {setFocused: false},
		"0.0.1": {setExpanded: true},
		"0.0.1.1": {setFocused: true}, "0.0.1.1.0": {setFocused: true}, "0.0.1.1.1": {setFocused: true}}}),
	new Keyframe({time: 3, actions: {all: {setFocused: false},
		0.1: {setFocused: true}, "0.0.1.2.1": {setFocused: true}, "0.1.1": {setFocused: true}}}),
];
export function GetKeyframeActionsToApplyToNode(nodeID: string, targetTime: number) {
	const keyframesInTimeRange = keyframes.filter(a=>a.time <= targetTime);
	const result = [] as Action[];
	for (const keyframe of keyframesInTimeRange) {
		for (const [target, action] of Object.entries(keyframe.actions)) {
			if (target == nodeID || target == "all") {
				result.push(action);
			}
		}
	}
	return result;
}
export function GetNodeStateFromKeyframes(nodeID: string, targetTime: number) {
	const actions = GetKeyframeActionsToApplyToNode(nodeID, targetTime);
	const result = new NodeState();
	for (const action of actions) {
		if (action.setExpanded != null) result.expanded = action.setExpanded;
		if (action.setFocused != null) result.focused = action.setFocused;
	}
	return result;
}
export function GetFocusNodePaths(mapInfo: MapInfo, targetTime: number) {
	//const nodeIDs = [...mapInfo.nodeStates.keys()].map(path=>GetNodeIDFromNodePath(path));
	//const nodes = GetAllNodesInTree(nodeTree_main);
	//const nodesByID = CE(nodes).ToMapObj(a=>a.id, a=>a);
	//const nodeStates = nodes.map(node=>mapInfo.GetNodeState(node.id));
	//return nodePaths.filter(([path, state])=>state.focused).map(([path])=>nodesByID[GetNodeIDFromNodePath(path)]).filter(a=>a != null);
	const nodePaths = [...mapInfo.nodeStates.keys()];
	return nodePaths.filter(path=>mapInfo.GetNodeState(path, undefined, targetTime).focused);
}

/*export function UpdateNodeTreeUsingKeyframes() {
	const keyframesToApply = keyframes.filter(a=>a.time <= store.targetTime);
	const newNodeTree = Clone(nodeTree_main_orig);
	for (const keyframe of keyframesToApply) {
		for (const [target, action] of Object.entries(keyframe.actions)) {
			const nodes = GetNodesForTarget(newNodeTree, target);
			for (const node of nodes) {
				if (action.setExpanded != null) node.expanded = action.setExpanded;
				if (action.setFocused != null) node.focused = action.setFocused;
			}
		}
	}
}*/

export function GetAllNodesInTree(nodeTree: MapNodeWithState) {
	const result = [] as MapNodeWithState[];
	result.push(nodeTree);
	for (const child of nodeTree.children) {
		result.push(...GetAllNodesInTree(child));
	}
	return result;
}

/*export function GetAllNodesInTree_ByTreePath<T extends MapNodeWithState>(nodeTree: T, path = "0") {
	const result = new Map<string, MapNodeWithState>();
	result.set(path, nodeTree);
	for (const [i, child] of nodeTree.children.entries()) {
		for (const [descendantPath, descendant] of GetAllNodesInTree_ByTreePath(child, `${path}/${i}`)) {
			result.set(descendantPath, descendant);
		}
	}
	return result;
}
export function GetNodeIDFromTreePath(treePath: string) {
	const allNodes = GetAllNodesInTree_ByTreePath(nodeTree_main);
	return allNodes.get(treePath)?.id;
}*/

export function GetAllNodesInTree_ByNodePath<T extends MapNodeWithState>(nodeTree: T, path = nodeTree.id) {
	const result = new Map<string, MapNodeWithState>();
	result.set(path, nodeTree);
	for (const child of nodeTree.children) {
		for (const [descendantPath, descendant] of GetAllNodesInTree_ByNodePath(child, `${path}/${child.id}`)) {
			result.set(descendantPath, descendant);
		}
	}
	return result;
}
export function GetNodeIDFromNodePath(path: string) {
	/*const allNodes = GetAllNodesInTree_ByNodePath(nodeTree_main);
	return allNodes.get(path)?.id;*/
	return CE(path.split("/")).Last();
}

export function GetNodesForTarget(nodeTree: MapNodeWithState, target: string) {
	const nodes = GetAllNodesInTree(nodeTree);
	return nodes.filter(a=>a.id == target || a.id == "all");
}