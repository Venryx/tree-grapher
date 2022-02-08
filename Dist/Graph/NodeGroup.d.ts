import { VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare class NodeGroup {
    constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">);
    graph: Graph;
    path: string;
    get ParentPath_Sortable(): string;
    leftColumnEl: HTMLElement;
    childHolderEl: HTMLElement | n;
    rect: VRect | n;
    get rect_base(): VRect | n;
    UpdateRect(): {
        newRect: VRect;
        oldRect: VRect;
        rectChanged: boolean;
    } | null;
    /** Updates this.rect, then notifies next-groups of their potentially needing to update their shifts. */
    CheckForMoveOrResize(): void;
    RecalculateChildHolderShift(updateRectFirst?: boolean): void;
    RecalculateLeftColumnAlign(): void;
}
