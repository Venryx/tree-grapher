import { Assert, Vector2 } from "js-vextensions";
import React, { useCallback, useContext, useMemo, useRef } from "react";
import { GraphContext } from "../Graph.js";
import { GetRectRelative } from "../Utils/General/General.js";
import { NodeConnectorOpts } from "./ConnectorLinesUI.js";
export function useRef_nodeLeftColumn(treePath, nodeConnectorOpts, alignWithParent) {
    nodeConnectorOpts = useMemo(() => Object.assign(new NodeConnectorOpts(), nodeConnectorOpts), 
    //[nodeConnectorOpts],
    // memoize based on json-representation of node-connector-opts; this way, layout system is robust to caller failing to memoize the options-object it passes in
    [JSON.stringify(nodeConnectorOpts)]);
    const graph = useContext(GraphContext);
    const ref_group = useRef(null);
    const ref_resizeObserver = useRef(null);
    const ref_leftColumn_storage = useRef();
    const ref_leftColumn = useCallback(el => {
        var _a, _b;
        ref_leftColumn_storage.current = el;
        if (el) {
            const group = graph.NotifyGroupLeftColumnMount(el, treePath, nodeConnectorOpts, alignWithParent);
            ref_group.current = group;
            const updateGroupRects = () => {
                group.lcSize = group.leftColumnEl && group.graph.containerEl ? GetRectRelative(group.leftColumnEl, group.graph.containerEl).Size : null;
                group.innerUISize = group.leftColumnEl && group.lcSize ? new Vector2(group.lcSize.x - group.GutterWidth, group.lcSize.y) : null;
            };
            // call once at start (atm needed to avoid rare case where element is attached, but rects aren't, and filter in children-func fails fsr)
            updateGroupRects();
            // until layout is run, set a style that makes the element non-visible
            (_b = (_a = graph.layoutOpts).styleSetter_layoutPending) === null || _b === void 0 ? void 0 : _b.call(_a, el.style);
            // clear these things, since we have a new left-column
            group.leftColumnEl_layoutCount = 0;
            // todo: maybe have these cleared
            /*group.lcRect_atLastRender = null;
            group.innerUIRect_atLastRender = null;*/
            // set up observer
            // NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
            const resizeObserver = new ResizeObserver(entries => {
                const entry = entries[0];
                if (group.IsDestroyed()) {
                    console.warn("group.IsDestroyed() returned true in left-column resizer-observer; this should not happen. Did you forget to wrap your usage of `ref_leftColumn` in a useCallback hook?");
                    return;
                }
                //group.graph.uiDebugKit?.FlashComp(group.leftColumnEl, {text: `LC_ResizeObs change. @bboxSize:${ROSizeArrToStr(entry.borderBoxSize)} @cboxSize:${ROSizeArrToStr(entry.contentBoxSize)} @rect:${JSON.stringify(entry.contentRect)}`});
                /*new Wave(graph, group, [
                    new MyLCResized({me: group, sender_extra: "LCResizeObs", newSize: VRect.FromLTWH(entry.contentRect).Size}),
                ]).Down_StartWave();*/
                //group.UpdateLCRect();
                updateGroupRects();
                graph.RunLayout_InAMoment();
            });
            ref_resizeObserver.current = resizeObserver;
            resizeObserver.observe(el);
            //group.RecalculateLeftColumnAlign({from: "ref_leftColumn"});
        }
        else {
            const group = ref_group.current;
            Assert(group && ref_resizeObserver.current, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
            ref_group.current = null;
            ref_resizeObserver.current.disconnect();
            ref_resizeObserver.current = null;
            graph.NotifyGroupLeftColumnUnmount(group);
        }
    }, [alignWithParent, graph, nodeConnectorOpts, treePath]);
    // also re-attach this element as the left-column every time it renders (group may have been deleted then recreated, from collapsing then expanding the node)
    /*useEffect(()=>{
        groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(ref.current as any as HTMLElement, treePath);
    });*/
    return { ref_leftColumn_storage, ref_leftColumn, ref_group };
}
export const NodeUI_LeftColumn = (props) => {
    let { treePath, nodeConnectorOpts, alignWithParent, children } = props;
    nodeConnectorOpts = Object.assign(new NodeConnectorOpts(), nodeConnectorOpts);
    const graph = useContext(GraphContext);
    const group = graph.groupsByPath.get(treePath);
    const gutterWidth = nodeConnectorOpts.gutterWidth + (nodeConnectorOpts.parentIsAbove ? nodeConnectorOpts.parentGutterWidth : 0); // rather than wait for group, just recalc gutter-width manually
    const { ref_leftColumn } = useRef_nodeLeftColumn(treePath, nodeConnectorOpts, alignWithParent);
    return (React.createElement("div", { ref: ref_leftColumn, className: "innerBoxColumn clickThrough", style: Object.assign(
        //!nodeConnectorOpts.parentIsAbove && {position: "absolute"} as const,
        { position: "absolute" }, 
        //{marginLeft: nodeConnectorOpts.gutterWidth},
        //{paddingLeft: nodeConnectorOpts.gutterWidth + (group && nodeConnectorOpts.parentIsAbove ? graph.FindParentGroup(group)?.leftColumn_connectorOpts.gutterWidth ?? 0 : 0)},
        { paddingLeft: gutterWidth }) }, children));
};
