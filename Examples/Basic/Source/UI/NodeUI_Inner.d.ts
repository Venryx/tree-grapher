import { MapNode } from "../@SharedByExamples/MapNode";
export declare const textRepeatSplitter = " [x2:] ";
export declare type PeersChangerFunc = (peers: MapNode[]) => MapNode[];
export declare type ChangePeersOrderFunc = (func: PeersChangerFunc) => void;
export declare const NodeUI_Inner: (props: {
    node: MapNode;
    path: string;
    inBelowGroup?: boolean;
    changePeersOrder?: ChangePeersOrderFunc;
}) => JSX.Element;
