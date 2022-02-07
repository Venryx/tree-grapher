/// <reference types="react" />
import { VRect } from "js-vextensions";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { RequiredBy } from "./Utils/@Internal/Types.js";
export declare const GraphContext: import("react").Context<Graph>;
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "columnWidth">);
    columnWidth: number;
    columns: TreeColumn[];
    GetColumnsForGroup(group: NodeGroupInfo): TreeColumn[];
    NotifyNodeGroupRendered(element: HTMLElement, treePath: string): NodeGroupInfo;
    NotifyNodeGroupUnrendered(group: NodeGroupInfo): NodeGroupInfo;
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
