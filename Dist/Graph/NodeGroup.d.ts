import { VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
import { TreeColumn } from "./TreeColumn.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare class NodeGroup {
    constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">);
    graph: Graph;
    path: string;
    get ParentPath_Sortable(): string;
    columnsPartOf: TreeColumn[];
    leftColumnEl: HTMLElement | n;
    childHolderEl: HTMLElement | n;
    get LCRect(): VRect | DOMRect;
    rect: VRect | n;
    UpdateRect(checkForSameColumnEffects?: boolean, checkForRightColumnEffects?: boolean): {
        newRect: VRect;
        oldRect: n | VRect;
        rectChanged: boolean;
    } | null;
    CheckForSameColumnEffectsFromRectChange(newRect: VRect, oldRect: VRect | n): void;
    CheckForRightColumnEffectsFromRectChange(newRect: VRect, oldRect: VRect | n): void;
    UpdateColumns(): void;
    RecalculateChildHolderShift(updateRectFirst?: boolean): void;
    RecalculateLeftColumnAlign(): void;
}
