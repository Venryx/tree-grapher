import { VRect } from "js-vextensions";
import { NodeGroupInfo } from "../Graph.js";
export declare class TreeColumn {
    constructor(data?: Partial<TreeColumn>);
    rect: VRect;
    /** Sorted by tree-path, at insert time. */
    groups_ordered: NodeGroupInfo[];
    AddGroup(group: NodeGroupInfo): void;
    RemoveGroup(group: NodeGroupInfo): void;
    GetNodeGroupInfo(groupElement: HTMLElement): NodeGroupInfo | undefined;
    FindNextGroupInVSpace(group: NodeGroupInfo): number | {
        groupsInVertSpace_earlier_lowest: NodeGroupInfo;
        shiftNeeded: number;
    };
}
