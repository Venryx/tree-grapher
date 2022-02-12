import { VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
import { TreeColumn } from "./TreeColumn.js";
import { ConnectorLinesUI_Handle, NodeConnectorOpts } from "../UI/ConnectorLinesUI.js";
import { Wave } from "../Waves/Wave.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare function AreRectsEqual(rect1: VRect | n, rect2: VRect | n, fieldsToCheck?: string[]): boolean;
export declare class WaveEffects {
    updateColumns: boolean;
    recalcLineSourcePoint: boolean;
    recalcLCAlign: boolean;
    updateConnectorLines: boolean;
    recalcCHShift: boolean;
    updateLCRect: boolean;
    updateCHRect: boolean;
}
export declare class NodeGroup {
    constructor(data?: RequiredBy<Partial<NodeGroup>, "graph" | "path">);
    graph: Graph;
    path: string;
    path_parts: string[];
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
    lineSourcePoint: number | n;
    chRect: VRect | n;
    get CHRect_Valid(): boolean;
    ForceUpdateRects(wave: Wave): void;
    /** Same as innerUIRect, but with the y-pos reduced to what it'd be if its container (ie. the left-column element) had set no padding-top; works alongside CHRect_Base(). */
    get InnerUIRect_Base(): VRect | null | undefined;
    /** Same as chRect, but with the margin removed; this is the "base"/resting-rect, which is the stable/reference point for (potentially multi-level) alignment operations. */
    get CHRect_Base(): VRect | null | undefined;
    ConvertToGlobalSpace_YPos(yPos: number, oldSpace_rect: VRect): number;
    ConvertFromGlobalSpace_YPos(yPos: number, newSpace_rect: VRect): number;
    ReceiveDownWave(wave: Wave): void;
    ReceiveUpWave(wave: Wave): void;
    RunEffects(fx: WaveEffects, wave: Wave): void;
    UpdateLCRect(wave: Wave): {
        newRect: VRect | null;
        oldRect: n | VRect;
        rectChanged: boolean;
    };
    /** Only to be called from NodeGroup.UpdateLCRect(). */
    private UpdateInnerUIRect;
    UpdateCHRect(wave: Wave): {
        newRect: VRect | null;
        oldRect: n | VRect;
        rectChanged: boolean;
    };
    UpdateColumns(): void;
    DetachAndDestroy(): void;
    Detach(): void;
    IsDestroyed(): boolean;
    Destroy(): void;
    RecalculateChildHolderShift(wave: Wave, updateCHRectFirst?: boolean): void;
    /** Stores the y-pos that should be used as the center target for the inner-ui's center, and the child-holder's connector-lines origins/anchors. (in global space) */
    RecalculateLineSourcePoint(wave: Wave): void;
    RecalculateLeftColumnAlign(wave: Wave): void;
    childConnectorInfos: Map<number, NodeConnectorInfo>;
    UpdateConnectorLines(): void;
    RefreshConnectorLinesUI(): void;
}
export declare class NodeConnectorInfo {
    constructor(data: NodeConnectorInfo);
    group: NodeGroup;
    rect: VRect | n;
    opts: NodeConnectorOpts | n;
}
