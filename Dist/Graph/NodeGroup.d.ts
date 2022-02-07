import { VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { RequiredBy } from "../Utils/@Internal/Types.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare function GetMarginTopFromStyle(style: CSSStyleDeclaration): number;
export declare class NodeGroup {
    constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "parentPath" | "element" | "rect">);
    graph: Graph;
    parentPath: string;
    get ParentPath_Sortable(): string;
    element: HTMLElement;
    rect: VRect;
    get rect_base(): VRect;
    UpdateRect(): {
        newRect: VRect;
        oldRect: VRect;
        rectChanged: boolean;
    };
    /** Updates this.rect, then notifies next-groups of their potentially needing to update their shifts. */
    CheckForMoveOrResize(): void;
    /** Make sure this.rect is up-to-date before calling this. (can call this.UpdateRect() beforehand) */
    RecalculateShift(updateRectFirst?: boolean): void;
}
