/// <reference types="react" />
import type { FlashComp } from "ui-debug-kit";
import { SpacingFunc } from "./Core/Core.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
import { ConnectorLinesUI_Handle, NodeConnectorOpts } from "./index.js";
import { n, RequiredBy } from "./Utils/@Internal/Types.js";
export declare const GraphContext: import("react").Context<Graph>;
export declare class Graph {
    constructor(data: RequiredBy<Partial<Graph>, "layoutOpts">);
    containerEl: HTMLElement;
    get ContainerPadding(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    connectorLinesComp: ConnectorLinesUI_Handle | n;
    layoutOpts: {
        nodeSpacing: SpacingFunc<NodeGroup>;
    };
    uiDebugKit?: {
        FlashComp: typeof FlashComp;
    };
    groupsByPath: Map<string, NodeGroup>;
    FindParentGroup(childGroup: NodeGroup): NodeGroup | undefined;
    FindChildGroups(parentGroup: NodeGroup): NodeGroup[];
    FindDescendantGroups(parentGroup: NodeGroup): NodeGroup[];
    GetOrCreateGroup(treePath: string): {
        group: NodeGroup;
        alreadyExisted: boolean;
    };
    NotifyGroupLeftColumnMount(el: HTMLElement, treePath: string, connectorOpts: NodeConnectorOpts, alignWithParent?: boolean): NodeGroup;
    NotifyGroupChildHolderMount(el: HTMLElement, treePath: string, belowParent: boolean): NodeGroup;
    NotifyGroupConnectorLinesUIMount(handle: ConnectorLinesUI_Handle): void;
    NotifyGroupLeftColumnUnmount(group: NodeGroup): void;
    NotifyGroupChildHolderUnmount(group: NodeGroup): void;
    NotifyGroupConnectorLinesUIUnmount(): void;
    RunLayout: (direction?: LayoutDirection) => void;
}
export declare type LayoutDirection = "topToBottom" | "leftToRight";
