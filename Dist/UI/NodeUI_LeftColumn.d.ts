import React from "react";
import { NodeGroup } from "../Graph/NodeGroup.js";
export declare function useRef_nodeLeftColumn(treePath: string): {
    ref_leftColumn: React.MutableRefObject<HTMLElement | null>;
    ref_group: React.MutableRefObject<NodeGroup | null>;
};
export declare const NodeUI_LeftColumn: (props: {
    treePath: string;
    children;
}) => JSX.Element;
