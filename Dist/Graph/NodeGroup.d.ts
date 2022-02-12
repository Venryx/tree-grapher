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
    path_sortable: string;
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
    get CHRect_Valid(): boolean;
    /** Same as innerUIRect, but with the y-pos reduced to what it'd be if its container (ie. the left-column element) had set no padding-top; works alongside CHRect_Base(). */
    get InnerUIRect_Base(): VRect | null | undefined;
    /** Same as chRect, but with the margin removed; this is the "base"/resting-rect, which is the stable/reference point for (potentially multi-level) alignment operations. */
    get CHRect_Base(): VRect | null | undefined;
    ConvertToGlobalSpace_YPos(yPos: number, oldSpace_rect: VRect): number;
    ConvertFromGlobalSpace_YPos(yPos: number, newSpace_rect: VRect): number;
    UpdateRects: (args: {
        from: string;
    } & Partial<{
        intResponse: boolean;
        extResponse: boolean;
    }>) => void;
    UpdateLCRect: (args: {
        from: string;
    } & Partial<{
        intResponse: boolean;
        extResponse: boolean;
    }>) => {
        newRect: VRect | null;
        oldRect: VRect | n;
        rectChanged: boolean;
    };
    /** Only to be called from NodeGroup.UpdateLCRect(). */
    private UpdateInnerUIRect;
    UpdateCHRect: (args: {
        from: string;
    } & Partial<{
        intResponse: boolean;
        extResponse: boolean;
    }>) => {
        newRect: VRect | null;
        oldRect: VRect | n;
        rectChanged: boolean;
    };
    UpdateColumns(): void;
    DetachAndDestroy(): void;
    Detach(): void;
    IsDestroyed(): boolean;
    Destroy(): void;
    RecalculateChildHolderShift: (args: {
        from: string;
    } & Partial<{
        updateRectFirst: boolean;
    }>) => void;
    /** Returns the y-pos that should be used as the center target for the inner-ui's center, and the child-holder's connector-lines origins/anchors. (in global space) */
    ChildHolderAnchorPoint: (args: {
        from: string;
    } & Partial<{
        extResponse: boolean;
        allowUpdatingChildRectFirst: boolean;
    }>) => number | null;
    RecalculateLeftColumnAlign: (args: {
        from: string;
    } & Partial<{
        extResponse: boolean;
    }>) => void;
    childConnectorInfos: Map<number, NodeConnectorInfo>;
    NotifyChildNodeConnectorInfoChanged(childIndex: number, newInfo: NodeConnectorInfo): void;
    RefreshConnectorLinesUI(): void;
}
export declare class NodeConnectorInfo {
    constructor(data: NodeConnectorInfo);
    rect: VRect | n;
    opts: NodeConnectorOpts | n;
}
