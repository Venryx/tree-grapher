/// <reference types="react" />
import { Vector2, VRect } from "js-vextensions";
import { IReactionDisposer } from "mobx";
import type { FlashComp } from "ui-debug-kit";
import { SpacingFunc } from "./Core/Core.js";
import { FlexNode } from "./Core/FlexNode.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
import { ConnectorLinesUI_Handle, NodeConnectorOpts } from "./index.js";
import { SpaceTakerUI_Handle } from "./UI/SpaceTakerUI.js";
import { n, RequiredBy } from "./Utils/@Internal/Types.js";
export declare const GraphContext: import("react").Context<Graph>;
export type KeyframeInfo = {
    layout: FlexNode<NodeGroup>;
    percentThroughTransition: number;
};
export declare function InterpolateVector(vecA: Vector2, vecB: Vector2, percent: number): Vector2;
export type Padding = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "layoutOpts">);
    containerEl?: HTMLElement;
    getScrollElFromContainerEl: (containerEl: HTMLElement) => HTMLElement | null;
    /** This should be a mobx-compatible getter function, which returns information required for smoothly animating changes to node positions. (will try to add animation of size-changes later) */
    private getNextKeyframeInfo?;
    private getGroupStablePath;
    animation_autorunDisposer?: IReactionDisposer;
    nextKeyframeInfo?: KeyframeInfo;
    StartAnimating(getNextKeyframeInfo: () => KeyframeInfo, getGroupStablePath: (group: NodeGroup) => string): void;
    StopAnimating(): void;
    containerPadding: Padding;
    spaceTakerComp: SpaceTakerUI_Handle | n;
    connectorLinesComp: ConnectorLinesUI_Handle | n;
    layoutOpts: {
        nodeSpacing: SpacingFunc<NodeGroup>;
        styleSetter_layoutPending?: (style: CSSStyleDeclaration) => any;
        styleSetter_layoutDone?: (style: CSSStyleDeclaration) => any;
    };
    uiDebugKit?: {
        FlashComp: typeof FlashComp;
    };
    groupsByPath: Map<string, NodeGroup>;
    groupsByParentPath: Map<string, Map<string, NodeGroup>>;
    FindParentGroup(childGroup: NodeGroup): NodeGroup | undefined;
    FindChildGroups(parentGroup: NodeGroup): NodeGroup[];
    FindDescendantGroups(parentGroup: NodeGroup): NodeGroup[];
    GetOrCreateGroup(treePath: string): {
        group: NodeGroup;
        alreadyExisted: boolean;
    };
    NotifyGroupLeftColumnMount(el: HTMLElement, treePath: string, connectorOpts: NodeConnectorOpts, userData: Object, alignWithParent?: boolean): NodeGroup;
    NotifyGroupChildHolderMount(el: HTMLElement, treePath: string, belowParent: boolean): NodeGroup;
    NotifySpaceTakerUIMount(handle: SpaceTakerUI_Handle): void;
    NotifyGroupConnectorLinesUIMount(handle: ConnectorLinesUI_Handle): void;
    NotifyGroupLeftColumnUnmount(group: NodeGroup): void;
    NotifyGroupChildHolderUnmount(group: NodeGroup): void;
    NotifySpaceTakerUIUnmount(): void;
    NotifyGroupConnectorLinesUIUnmount(): void;
    runLayout_scheduled: boolean;
    RunLayout_InAMoment: () => void;
    RunLayout: (direction?: LayoutDirection) => void;
    GetLayout: (direction?: LayoutDirection, nodeGroupFilter?: (group: NodeGroup) => boolean) => FlexNode<NodeGroup> | null;
    ApplyLayout: (ownLayout: FlexNode<NodeGroup>, direction?: LayoutDirection, applyAnimationModifiers?: boolean) => void;
}
export type LayoutDirection = "topToBottom" | "leftToRight";
export declare function GetTreeNodeBaseRect(treeNode: FlexNode<any>, direction?: LayoutDirection): VRect;
export declare function GetTreeNodeOffset(baseRects: VRect[], treeNodes: FlexNode<NodeGroup>[], containerPadding: Padding): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    offset: Vector2;
};
