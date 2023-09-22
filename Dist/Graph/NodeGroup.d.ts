import { Vector2, VRect } from "js-vextensions";
import { Graph } from "../Graph.js";
import { NodeConnectorOpts } from "../UI/ConnectorLinesUI.js";
import { n, RequiredBy } from "../Utils/@Internal/Types.js";
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export declare function TreePathAsSortableStr(treePath: string): string;
export declare function AreRectsEqual(rect1: VRect | n, rect2: VRect | n, fieldsToCheck?: string[]): boolean;
export declare class WaveEffects {
    updateColumns: boolean;
    recalcLineSourcePoint: boolean;
    recalcLCAlign: boolean;
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
    leftColumnEl: HTMLElement | n;
    leftColumn_connectorOpts: NodeConnectorOpts;
    leftColumn_userData: Object;
    leftColumn_alignWithParent?: boolean;
    childHolderEl: HTMLElement | n;
    childHolder_belowParent: boolean;
    get GutterWidth(): number;
    assignedPosition: Vector2;
    assignedPosition_final: Vector2;
    lcSize_old: Vector2 | n;
    lcSize: Vector2 | n;
    innerUISize_old: Vector2 | n;
    innerUISize: Vector2 | n;
    lineSourcePoint: number | n;
    leftColumnEl_layoutCount: number;
    lcRect_atLastRender: VRect | n;
    innerUIRect_atLastRender: VRect | n;
    get LCRect_Old(): VRect | null;
    get LCRect(): VRect | null;
    get InnerUIRect_Old(): VRect | null;
    get InnerUIRect(): VRect | null;
    DetachAndDestroy(): void;
    Detach(): void;
    IsDestroyed(): boolean;
    Destroy(): void;
}
export declare class NodeConnectorInfo {
    constructor(data: NodeConnectorInfo);
    group: NodeGroup;
    rect: VRect | n;
    opts: NodeConnectorOpts | n;
}
