import React from "react";
import { Vector2 } from "js-vextensions";
import { NodeGroup } from "../Graph/NodeGroup.js";
import { n } from "../Utils/@Internal/Types.js";
export declare function useRef_connectorLinesUI(treePath: string, handle: ConnectorLinesUI_Handle): {
    ref_connectorLinesUI: React.MutableRefObject<SVGSVGElement | null>;
    ref_group: React.MutableRefObject<NodeGroup | null>;
};
export declare class NodeConnectorOpts {
    color?: string;
}
export declare type ChildBoxInfo_AtRenderTime = {
    offset: Vector2;
    opts: NodeConnectorOpts | n;
};
export declare class ConnectorLinesUI_Handle {
    constructor(data: ConnectorLinesUI_Handle);
    props: React.PropsWithoutRef<typeof ConnectorLinesUI>;
    svgEl: SVGSVGElement;
    forceUpdate: () => void;
}
export declare const ConnectorLinesUI: React.MemoExoticComponent<(props: {
    treePath: string;
    width: number;
    linesFromAbove?: boolean;
}) => JSX.Element | null>;
