import { VRect } from "js-vextensions";
import { RequiredBy } from "./Utils/@Internal/Types.js";
export declare class Graph {
    static main: Graph;
    nodeGroupInfos: NodeGroupInfo[];
    GetNodeGroupInfo(groupElement: HTMLElement): NodeGroupInfo | undefined;
    NotifyNodeGroupRendered(element: HTMLElement, graphInfo: GraphPassInfo): NodeGroupInfo;
    NotifyNodeGroupUnrendered(group: NodeGroupInfo): void;
}
export declare class NodeGroupInfo {
    constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "treePath" | "element" | "rect">);
    treePath: number[];
    element: HTMLElement;
    rect: VRect;
}
export declare class GraphPassInfo {
    treePath: number[];
}
