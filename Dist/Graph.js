import { CE } from "js-vextensions";
import { GetPageRect } from "./Utils/General/General.js";
export class Graph {
    constructor() {
        this.nodeGroupInfos = [];
    }
    GetNodeGroupInfo(groupElement) {
        return this.nodeGroupInfos.find(a => a.element == groupElement);
    }
    NotifyNodeGroupRendered(element, treePath) {
        const rect = GetPageRect(element);
        const entry = new NodeGroupInfo({
            parentPath: treePath,
            element,
            rect,
        });
        this.nodeGroupInfos.push(entry);
        return entry;
    }
    NotifyNodeGroupUnrendered(group) {
        CE(this.nodeGroupInfos).Remove(group);
    }
}
Graph.main = new Graph();
export class NodeGroupInfo {
    constructor(data) {
        Object.assign(this, data);
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
