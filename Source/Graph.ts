import {CE, VRect} from "js-vextensions";
import {n, RequiredBy} from "./Utils/@Internal/Types.js";
import {GetPageRect} from "./Utils/General/General.js";

export class Graph {
	static main = new Graph();

	nodeGroupInfos: NodeGroupInfo[] = [];
	GetNodeGroupInfo(groupElement: HTMLElement) {
		return this.nodeGroupInfos.find(a=>a.element == groupElement);
	}
	NotifyNodeGroupRendered(element: HTMLElement, treePath: string) {
		const rect = GetPageRect(element);
		const entry = new NodeGroupInfo({
			parentPath: treePath,
			element,
			rect,
		});
		this.nodeGroupInfos.push(entry);
		return entry;
	}
	NotifyNodeGroupUnrendered(group: NodeGroupInfo) {
		CE(this.nodeGroupInfos).Remove(group);
	}
}

export class NodeGroupInfo {
	constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "parentPath" | "element" | "rect">) {
		Object.assign(this, data);
	}
	parentPath: string;
	element: HTMLElement;
	rect: VRect;
}

/*export class GraphPassInfo {
	treePath: string;
}*/