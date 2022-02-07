import { VRect } from "js-vextensions";
import { RequiredBy } from "./Utils/@Internal/Types.js";
export declare class Graph {
    static main: Graph;
    nodeGroupInfos: NodeGroupInfo[];
    GetNodeGroupInfo(groupElement: HTMLElement): NodeGroupInfo | undefined;
    NotifyNodeGroupRendered(element: HTMLElement, treePath: string): NodeGroupInfo;
    NotifyNodeGroupUnrendered(group: NodeGroupInfo): void;
}
export declare class NodeGroupInfo {
    constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "parentPath" | "element" | "rect">);
    parentPath: string;
    element: HTMLElement;
    rect: VRect;
}
