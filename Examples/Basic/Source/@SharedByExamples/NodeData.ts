import {MapNode} from "./MapNode";
import {RequiredBy} from "./Utils/General.js";

export type MapNodeWithExpandState = Omit<MapNode, "children"> & {children: MapNodeWithExpandState[], expanded?: boolean};
function NewNode(data: RequiredBy<Partial<MapNodeWithExpandState>, "id">) {
	return new MapNode(data) as MapNodeWithExpandState;
}

export const nodeTree_main = NewNode({
	id: "0",
	expanded: true,
	children: [
		NewNode({
			id: "0.0",
			expanded: true,
			children: [
				NewNode({
					id: "0.0.0",
					expanded: true,
					children: [
					],
				}),
				NewNode({
					id: "0.0.1",
					expanded: true,
					children: [
					],
				}),
			],
		}),
		NewNode({
			id: "0.1",
			expanded: true,
			children: [
				NewNode({
					id: "0.1.0",
					expanded: true,
					children: [
					],
				}),
				NewNode({
					id: "0.1.1",
					expanded: true,
					children: [
					],
				}),
			],
		}),
	],
});

export function GetAllNodesInTree(nodeTree: MapNodeWithExpandState) {
	let result = [] as MapNodeWithExpandState[];
	result.push(nodeTree);
	for (const child of nodeTree.children) {
		result.push(...GetAllNodesInTree(child));
	}
	return result;
}
export function GetAllNodesInTree_ByPath<T extends MapNodeWithExpandState>(nodeTree: T, path = "0") {
	let result = new Map<string, MapNodeWithExpandState>();
	result.set(path, nodeTree);
	for (const [i, child] of nodeTree.children.entries()) {
		for (const [descendantPath, descendant] of GetAllNodesInTree_ByPath(child, path + "/" + i)) {
			result.set(descendantPath, descendant);
		}
	}
	return result;
}