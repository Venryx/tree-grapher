import React from "react";
import { Graph } from "../index.js";
export declare function useRef_spaceTakerUI(graph: Graph, handle: SpaceTakerUI_Handle): {
    ref_spaceTakerUI: React.MutableRefObject<HTMLDivElement | null>;
    graph: Graph;
};
export declare class SpaceTakerUI_Handle {
    constructor(data: SpaceTakerUI_Handle);
    props: React.PropsWithoutRef<typeof SpaceTakerUI>;
    divEl: HTMLDivElement;
    forceUpdate: () => void;
}
export declare const SpaceTakerUI: React.MemoExoticComponent<(props: {
    graph: Graph;
    scaling?: number;
}) => JSX.Element | null>;
