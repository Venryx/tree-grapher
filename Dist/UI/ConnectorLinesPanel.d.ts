import React from "react";
import { Vector2 } from "js-vextensions";
import { NodeGroup } from "../Graph/NodeGroup.js";
export declare function useRef_connectorLinesPanel(treePath: string): {
    ref_childHolder: any;
    ref_group: React.MutableRefObject<NodeGroup | null>;
};
export declare type ChildBoxInfo = {
    color: string;
    offset: Vector2;
};
export declare const ConnectorLinesPanel: React.MemoExoticComponent<(props: {
    treePath: string;
    width: number;
    straightLines?: boolean;
}) => JSX.Element>;
