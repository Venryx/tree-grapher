/// <reference types="react" />
import { TreeColumn } from "./Graph/TreeColumn.js";
import { RequiredBy } from "./Utils/@Internal/Types.js";
import type { FlashComp } from "ui-debug-kit";
import { NodeGroup } from "./Graph/NodeGroup.js";
export declare const GraphContext: import("react").Context<Graph>;
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "columnWidth">);
    containerEl: HTMLElement;
    columnWidth: number;
    uiDebugKit?: {
        FlashComp: typeof FlashComp;
    };
    columns: TreeColumn[];
    groupsByPath: Map<string, NodeGroup>;
    FindChildGroups(parentGroup: NodeGroup): NodeGroup[];
    FindDescendantGroups(parentGroup: NodeGroup): NodeGroup[];
    GetColumnsForGroup(group: NodeGroup): TreeColumn[];
    GetNextGroupsWithinColumnsFor(group: NodeGroup): Set<NodeGroup>;
    GetOrCreateGroup(treePath: string): {
        group: NodeGroup;
        alreadyExisted: boolean;
    };
    NotifyGroupLeftColumnMountOrRender(leftColumnEl: HTMLElement, treePath: string): NodeGroup;
    NotifyGroupChildHolderMount(childHolderEl: HTMLElement, treePath: string): NodeGroup;
    NotifyGroupLeftColumnUnmount(group: NodeGroup): void;
    NotifyGroupChildHolderUnmount(group: NodeGroup): void;
}
