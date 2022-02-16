import React from "react";
export declare function useRef_connectorLinesUI(handle: ConnectorLinesUI_Handle): {
    ref_connectorLinesUI: React.MutableRefObject<SVGSVGElement | null>;
    graph: import("../Graph.js").Graph;
};
export declare class NodeConnectorOpts {
    gutterWidth: number;
    parentGutterWidth: number;
    parentIsAbove?: boolean;
    color?: string;
}
export declare class ConnectorLinesUI_Handle {
    constructor(data: ConnectorLinesUI_Handle);
    props: React.PropsWithoutRef<typeof ConnectorLinesUI>;
    svgEl: SVGSVGElement;
    forceUpdate: () => void;
}
export declare const ConnectorLinesUI: React.MemoExoticComponent<(props: {}) => JSX.Element>;
