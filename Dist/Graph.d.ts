/// <reference types="react" />
import type { FlashComp } from "ui-debug-kit";
import { SpacingFunc } from "./Core/Core.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
import { ConnectorLinesUI_Handle, NodeConnectorOpts } from "./index.js";
import { SpaceTakerUI_Handle } from "./UI/SpaceTakerUI.js";
import { n, RequiredBy } from "./Utils/@Internal/Types.js";
export declare const GraphContext: import("react").Context<Graph>;
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "layoutOpts">);
    containerEl?: HTMLElement;
    containerPadding: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
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
}
export declare type LayoutDirection = "topToBottom" | "leftToRight";
