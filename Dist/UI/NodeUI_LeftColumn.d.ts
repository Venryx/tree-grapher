import React from "react";
import { NodeGroup } from "../Graph/NodeGroup.js";
import { NodeConnectorOpts } from "./ConnectorLinesUI.js";
export declare function useRef_nodeLeftColumn(treePath: string, nodeConnectorOpts?: NodeConnectorOpts, userData?: Object, alignWithParent?: boolean): {
    ref_leftColumn_storage: React.MutableRefObject<HTMLElement | undefined>;
    ref_leftColumn: (el: any) => void;
    ref_group: React.MutableRefObject<NodeGroup | null>;
};
/** Note: Generally, it's recommended to use the "useRef_nodeLeftColumn" hook rather than this alternative. */
export declare const NodeUI_LeftColumn: (props: {
    treePath: string;
    nodeConnectorOpts?: NodeConnectorOpts;
    userData?: Object;
    alignWithParent?: boolean;
    children;
}) => JSX.Element;
