import { VRect } from "js-vextensions";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
import { NodeGroup } from "./NodeGroup.js";
export declare class TreeColumn {
    constructor(data?: RequiredBy<Partial<TreeColumn>, "index">);
    index: number;
    rect: VRect;
    /** Sorted by tree-path, at insert time. */
    groups_ordered: NodeGroup[];
    AddGroup(group: NodeGroup): void;
    RemoveGroup(group: NodeGroup): void;
    GetNodeGroupInfo(childHolderEl: HTMLElement): NodeGroup | undefined;
    FindPreviousGroups(group: NodeGroup): NodeGroup[];
    FindPreviousGroup_LowestCHRect(group: NodeGroup): NodeGroup | n;
    FindNextGroups(group: NodeGroup): NodeGroup[];
    FindNextGroup_HighestCHRect(group: NodeGroup): NodeGroup | n;
}
export declare function IsXAncestorOfY(xPath: string, yPath: string): boolean;
export declare function IsXAncestor_OrSiblingOfAncestor_OfY(xPath: string, yPath: string): boolean;
