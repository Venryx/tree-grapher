import { VRect } from "js-vextensions";
import { RequiredBy } from "./Utils/@Internal/Types.js";
export declare class Graph {
    static main: Graph;
    nodeGroupInfos: NodeGroupInfo[];
    GetNodeGroupInfo(groupElement: HTMLElement): NodeGroupInfo | undefined;
    NotifyNodeGroupRendered(element: HTMLElement, treePath: string): NodeGroupInfo;
    NotifyNodeGroupUnrendered(group: NodeGroupInfo): void;
    FindNextGroupInVSpace(group: NodeGroupInfo): number | {
        groupsInVertSpace_earlier_lowest: NodeGroupInfo;
        shiftNeeded: number;
    };
}
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare class NodeGroupInfo {
    constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "parentPath" | "element" | "rect">);
    parentPath: string;
    get ParentPath_Sortable(): string;
    element: HTMLElement;
    rect: VRect;
}
