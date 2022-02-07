import { VRect } from "js-vextensions";
import { n } from "../Utils/@Internal/Types.js";
import { NodeGroup } from "./NodeGroup.js";
export declare class TreeColumn {
    constructor(data?: Partial<TreeColumn>);
    rect: VRect;
    /** Sorted by tree-path, at insert time. */
    groups_ordered: NodeGroup[];
    AddGroup(group: NodeGroup): void;
    RemoveGroup(group: NodeGroup): void;
    GetNodeGroupInfo(groupElement: HTMLElement): NodeGroup | undefined;
    FindPreviousGroup(group: NodeGroup): NodeGroup | n;
    FindNextGroup(group: NodeGroup): NodeGroup | n;
}
