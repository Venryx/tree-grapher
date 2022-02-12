import React, { useCallback, useContext, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
import { Column } from "./@Shared/Basics.js";
import ReactDOM from "react-dom";
import { Assert, VRect } from "js-vextensions";
import { Wave } from "../Waves/Wave.js";
import { MyLCResized } from "../Waves/Messages.js";
export function useRef_nodeLeftColumn(treePath, connectorLineOpts, alignWithParent) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    let ref_resizeObserver = useRef(null);
    let ref_leftColumn = useCallbackRef(null, el => {
        //let ref = useCallback(el=>{
        if (el) {
            let group = graph.NotifyGroupLeftColumnMount(el, treePath, connectorLineOpts, alignWithParent);
            ref_group.current = group;
            // set up observer
            // NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
            const resizeObserver = new ResizeObserver(entries => {
                let entry = entries[0];
                if (group.IsDestroyed()) {
                    console.warn("group.IsDestroyed() returned true in left-column resizer-observer; this should not happen. Did you forget to wrap your usage of `ref_leftColumn` in a useCallback hook?");
                    return;
                }
                /*if (group.leftColumnEl_sizeChangesToIgnore > 0) {
                    group.leftColumnEl_sizeChangesToIgnore--;
                    return;
                }*/
                //group.graph.uiDebugKit?.FlashComp(group.leftColumnEl, {text: `LC_ResizeObs change. @bboxSize:${ROSizeArrToStr(entry.borderBoxSize)} @cboxSize:${ROSizeArrToStr(entry.contentBoxSize)} @rect:${JSON.stringify(entry.contentRect)}`});
                new Wave(graph, group, [
                    new MyLCResized({ me: group, sender_extra: "LCResizeObs", newSize: VRect.FromLTWH(entry.contentRect).Size }),
                ]).Down_StartWave();
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
    });
    //}, []);
    // also re-attach this element as the left-column every time it renders (group may have been deleted then recreated, from collapsing then expanding the node)
    /*useEffect(()=>{
        groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(ref.current as any as HTMLElement, treePath);
    });*/
    return { ref_leftColumn, ref_group };
}
export const NodeUI_LeftColumn = (props) => {
    let { treePath, connectorLineOpts, alignWithParent, children } = props;
    const graph = useContext(GraphContext);
    const group = graph.groupsByPath.get(treePath);
    let { ref_leftColumn } = useRef_nodeLeftColumn(treePath, connectorLineOpts, alignWithParent);
    return (React.createElement(Column
    //ref={ref}
    , { 
        //ref={ref}
        ref: useCallback(c => {
            ref_leftColumn.current = ReactDOM.findDOMNode(c);
            //ref(c ? GetDOM(c) as any : null), [ref]);
        }, []), className: "innerBoxColumn clickThrough", style: Object.assign({
            position: "relative",
            /*paddingTop: gapBeforeInnerUI,
            paddingBottom: gapAfterInnerUI,*/
        }) }, children));
};
