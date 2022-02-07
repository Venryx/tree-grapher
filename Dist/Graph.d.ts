/// <reference types="react" />
import { VRect } from "js-vextensions";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { RequiredBy } from "./Utils/@Internal/Types.js";
import type { FlashComp } from "ui-debug-kit";
export declare const GraphContext: import("react").Context<Graph>;
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "columnWidth">);
    columnWidth: number;
    uiDebugKit?: {
        FlashComp: typeof FlashComp;
    };
    columns: TreeColumn[];
    groupsByPath: Map<string, NodeGroupInfo>;
    GetColumnsForGroup(group: NodeGroupInfo): TreeColumn[];
    GetNextGroupsWithinColumnsFor(group: NodeGroupInfo): Set<NodeGroupInfo>;
    NotifyGroupUIMount(element: HTMLElement, treePath: string): NodeGroupInfo;
    NotifyGroupUIMoveOrResize(group: NodeGroupInfo, rect: VRect): void;
    NotifyGroupUIUnmount(group: NodeGroupInfo): NodeGroupInfo;
}
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare class NodeGroupInfo {
    constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "graph" | "parentPath" | "element" | "rect">);
    graph: Graph;
    parentPath: string;
    get ParentPath_Sortable(): string;
    element: HTMLElement;
    rect: VRect;
    RecalculateShift(): void;
}
