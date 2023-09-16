/// <reference types="react" />
import { MapNode } from "../@SharedByExamples/MapNode";
import { ChangePeersOrderFunc } from "./NodeUI_Inner";
export declare const NodeUI: (props: {
    node: MapNode;
    path: string;
    inBelowGroup?: boolean;
    changePeersOrder?: ChangePeersOrderFunc;
}) => JSX.Element;
export declare function NodeUI_RightColumn(props: {
    treePath: string;
    children: any;
}): JSX.Element;
