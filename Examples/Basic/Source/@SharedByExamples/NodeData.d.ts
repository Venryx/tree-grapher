import { NodeState } from "../Root";
import { MapNode } from "./MapNode";
export declare type MapNodeWithState = Omit<MapNode, "children"> & {
    children: MapNodeWithState[];
    expanded?: boolean;
    focused?: boolean;
};
export declare class Keyframe {
    constructor(data?: Partial<Keyframe>);
    time: number;
    actions: {
        [key: string]: Action;
    };
}
export declare class Action {
    setExpanded?: boolean;
    setFocused?: boolean;
}
export declare const nodeTree_main: MapNodeWithState;
export declare const nodeTree_main_orig: any;
export declare const keyframes: Keyframe[];
export declare function GetKeyframeActionsToApplyToNode(nodeID: string): Action[];
export declare function GetNodeStateFromKeyframes(nodeID: string): NodeState;
export declare function GetAllNodesInTree(nodeTree: MapNodeWithState): MapNodeWithState[];
export declare function GetAllNodesInTree_ByPath<T extends MapNodeWithState>(nodeTree: T, path?: string): Map<string, MapNodeWithState>;
export declare function GetNodesForTarget(nodeTree: MapNodeWithState, target: string): MapNodeWithState[];
