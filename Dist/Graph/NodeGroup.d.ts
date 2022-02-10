import { VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
import { TreeColumn } from "./TreeColumn.js";
import { ConnectorLinesUI_Handle, NodeConnectorOpts } from "../UI/ConnectorLinesUI.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare function AreRectsEqual(rect1: VRect | n, rect2: VRect | n, fieldsToCheck?: string[]): boolean;
export declare class NodeGroup {
    constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">);
    graph: Graph;
    path: string;
    get ParentPath_Sortable(): string;
    columnsPartOf: TreeColumn[];
    leftColumnEl: HTMLElement | n;
    leftColumn_connectorOpts?: NodeConnectorOpts;
    leftColumn_alignWithParent?: boolean;
    childHolderEl: HTMLElement | n;
    childHolder_belowParent: boolean;
    connectorLinesComp: ConnectorLinesUI_Handle | n;
    lcRect: VRect | n;
    innerUIRect: VRect | n;
    chRect: VRect | n;
    /** Same as innerUIRect, but with the y-pos reduced to what it'd be if its container (ie. the left-column element) had set no padding-top; works alongside CHRect_Base(). */
    get InnerUIRect_Base(): VRect | null | undefined;
    /** Same as chRect, but with the margin removed; this is the "base"/resting-rect, which is the stable/reference point for (potentially multi-level) alignment operations. */
    get CHRect_Base(): VRect | null | undefined;
    UpdateRects(): void;
    UpdateLCRect(): {
        newRect: VRect | null;
        oldRect: VRect | n;
        rectChanged: boolean;
    };
    /** Only to be called from NodeGroup.UpdateLCRect(). */
    private UpdateInnerUIRect;
    UpdateCHRect(checkForSameColumnEffects?: boolean, checkForRightColumnEffects?: boolean): {
        newRect: VRect | null;
        oldRect: VRect | n;
        rectChanged: boolean;
    };
    CheckForSameColumnEffectsFromRectChange(newRect: VRect | n, oldRect: VRect | n): void;
    CheckForRightColumnEffectsFromRectChange(newRect: VRect | n, oldRect: VRect | n): void;
    UpdateColumns(): void;
    DetachAndDestroy(): void;
    Detach(): void;
    IsDestroyed(): boolean;
    Destroy(): void;
    RecalculateChildHolderShift(updateRectFirst?: boolean): void;
    RecalculateLeftColumnAlign(): void;
    childConnectorInfos: Map<number, NodeConnectorInfo>;
    NotifyChildNodeConnectorInfoChanged(childIndex: number, newInfo: NodeConnectorInfo): void;
    RefreshConnectorLinesUI(): void;
}
export declare class NodeConnectorInfo {
    constructor(data: NodeConnectorInfo);
    rect: VRect | n;
    opts: NodeConnectorOpts | n;
}
