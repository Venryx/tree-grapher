import React from "react";
import { NodeGroup } from "../Graph/NodeGroup.js";
import { NodeConnectorOpts } from "./ConnectorLinesUI.js";
export declare function useRef_nodeLeftColumn(treePath: string, connectorLineOpts?: NodeConnectorOpts): {
    ref_leftColumn: React.MutableRefObject<HTMLElement | null>;
    ref_group: React.MutableRefObject<NodeGroup | null>;
};
export declare const NodeUI_LeftColumn: (props: {
    treePath: string;
    connectorLineOpts?: NodeConnectorOpts;
    children;
}) => JSX.Element;
