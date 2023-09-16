import React from "react";
export declare class MapInfo {
    constructor();
    nodeStates: Map<string, NodeState>;
    GetNodeState(path: string): NodeState;
}
export declare class NodeState {
    constructor();
    expanded: boolean;
    focused: boolean;
}
export declare const MapContext: React.Context<MapInfo>;
export declare function GetURLOptions(): {
    anim: boolean;
    nodeSpacing: number;
};
export declare const urlOpts: {
    anim: boolean;
    nodeSpacing: number;
};
export declare function RootUI(): JSX.Element;
