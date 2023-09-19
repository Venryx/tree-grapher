import { VRect } from "js-vextensions";
import React, { useCallback, useMemo } from "react";
import { useCallbackRef } from "use-callback-ref";
import { useForceUpdate } from "../index.js";
export function useRef_spaceTakerUI(graph, handle) {
    //const graph = useContext(GraphContext); // commented; we can't get graph from context, since the space-taker is expected to be outside the context-provider (since outside of scaling-applied container)
    const ref_spaceTakerUI = useCallbackRef(null, el => {
        if (el) {
            handle.divEl = el;
            graph.NotifySpaceTakerUIMount(handle);
        }
        else {
            graph.NotifySpaceTakerUIUnmount();
        }
    });
    return { ref_spaceTakerUI, graph };
}
export class SpaceTakerUI_Handle {
    constructor(data) {
        Object.assign(this, data);
    }
    props;
    divEl; // maybe rework this
    forceUpdate;
}
export const SpaceTakerUI = React.memo((props) => {
    const forceUpdate = useForceUpdate();
    const handle = useMemo(() => new SpaceTakerUI_Handle({ props: props, divEl: null, forceUpdate }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        // pass each individual prop as a dependency (passing entire props object would cause this memo to be invalidated every time)
        // todo: confirm this is correct
        props.graph, props.scaling, forceUpdate,
    ]);
    const { ref_spaceTakerUI, graph } = useRef_spaceTakerUI(props.graph, handle);
    const refCallback = useCallback(el => ref_spaceTakerUI.current = el, [ref_spaceTakerUI]);
    if (graph == null)
        return null;
    const groups = [...graph.groupsByPath.values()];
    //const containerPadding = graph.containerPadding;
    const rectForAllNodes = groups.find(a => a.lcRect_atLastRender != null)?.lcRect_atLastRender ?? new VRect(0, 0, 0, 0);
    for (const group of groups) {
        if (group.lcRect_atLastRender == null || group.innerUIRect_atLastRender == null)
            return null;
        rectForAllNodes.Encapsulate(group.lcRect_atLastRender);
    }
    const scaling = props.scaling ?? 1;
    /*if (graph.containerEl) {
        /*graph.containerEl.style.width = `calc(${rectForAllNodes.width + containerPadding.left + containerPadding.right}px / ${scaling})`;
        graph.containerEl.style.height = `calc(${rectForAllNodes.height + containerPadding.top + containerPadding.bottom}px / ${scaling})`;*#/
        graph.containerEl.style.width = `${rectForAllNodes.Right + rectForAllNodes.x}px`;
        graph.containerEl.style.height = `${rectForAllNodes.Bottom + rectForAllNodes.y}px`;
        //return null;
    }*/
    return (React.createElement("div", { ref: refCallback, style: {
            position: "relative", pointerEvents: "none",
            /*width: (rectForAllNodes.width + containerPadding.left + containerPadding.right) * scaling,
            height: (rectForAllNodes.height + containerPadding.top + containerPadding.bottom) * scaling,*/
            width: `${(rectForAllNodes.Right + rectForAllNodes.x) * scaling}px`,
            height: `${(rectForAllNodes.Bottom + rectForAllNodes.y) * scaling}px`,
        } }));
});
