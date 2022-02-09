import React, { useCallback, useContext, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
import { Column } from "./@Shared/Basics.js";
import ReactDOM from "react-dom";
import { Assert } from "js-vextensions";
export function useRef_nodeLeftColumn(treePath) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    let ref_resizeObserver = useRef(null);
    let ref_leftColumn = useCallbackRef(null, el => {
        //let ref = useCallback(el=>{
        if (el) {
            let group = graph.NotifyGroupLeftColumnMountOrRender(el, treePath);
            ref_group.current = group;
            // set up observer
            const resizeObserver = new ResizeObserver(entries => {
                let entry = entries[0];
                //if (ref_leftColumn.current == null || group.IsDestroyed()) return;
                let info = group.UpdateRect();
                // even if rect did not change, we still have to check for left-column realignment
                if (info && !info.rectChanged) {
                    group.RecalculateLeftColumnAlign();
                }
            });
            ref_resizeObserver.current = resizeObserver;
            resizeObserver.observe(el);
            group.RecalculateLeftColumnAlign();
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
    let { treePath, children } = props;
    const graph = useContext(GraphContext);
    const group = graph.groupsByPath.get(treePath);
    let { ref_leftColumn } = useRef_nodeLeftColumn(treePath);
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
