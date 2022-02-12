import { useContext, useMemo, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
import { Assert, VRect } from "js-vextensions";
import { MyCHResized, Wave } from "../index.js";
export function useRef_nodeChildHolder(treePath, belowParent = false) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    const store = useMemo(() => ({
        renderCount: 0,
        /*width: -1,
        height: -1,*/
    }), []);
    // I think a plain closure-var would also work, but for consistency/clarity, we'll use a ref
    //let resizeObserver: ResizeObserver;
    let ref_resizeObserver = useRef(null);
    let ref_childHolder = useCallbackRef(null, el => {
        //let ref = useCallback(el=>{
        //if (groupBelowParent) return;
        //ref2(el);
        //console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
        //console.log(`${el ? "Mount" : "Unmount"}`);
        if (el) {
            let group = graph.NotifyGroupChildHolderMount(el, treePath, belowParent);
            ref_group.current = group;
            // set up observer
            // NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
            const resizeObserver = new ResizeObserver(entries => {
                let entry = entries[0];
                if (group.IsDestroyed()) {
                    console.warn("group.IsDestroyed() returned true in node-child-holder resizer-observer; this should not happen. Did you forget to wrap your usage of `ref_leftColumn` in a useCallback hook?");
                    return;
                }
                /*if (group.childHolderEl_sizeChangesToIgnore > 0) {
                    group.childHolderEl_sizeChangesToIgnore--;
                    return;
                }*/
                new Wave(graph, group, [
                    new MyCHResized({ me: group, sender_extra: "CHResizeObs", newSize: VRect.FromLTWH(entry.contentRect).Size }),
                ]).Down_StartWave();
            });
            ref_resizeObserver.current = resizeObserver;
            resizeObserver.observe(el);
            //group.RecalculateLeftColumnAlign({from: "NCH_Hooks_ResizeObs"}); // call once, for first render
            //group.RecalculateChildHolderShift({from: "NCH_Hooks_ResizeObs"}); // call once, for first render
        }
        else {
            const group = ref_group.current;
            Assert(group && ref_resizeObserver.current, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
            ref_group.current = null;
            ref_resizeObserver.current.disconnect();
            ref_resizeObserver.current = null;
            graph.NotifyGroupChildHolderUnmount(group);
        }
    });
    //}, []);
    /*useEffect(()=>{
        store.renderCount++;
        const newRect = VRect.FromLTWH(ref.current!.getBoundingClientRect());
        const rectChanged = !newRect.Equals(groupInfo.current?.rect);
        //Object.assign(store, {width: newWidth, height: newHeight});
        graph.uiDebugKit?.FlashComp(ref.current, {text: `Rendering... @rc:${store.renderCount} @rect:${newRect}`});

        // if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
        if (rectChanged) {
            graph.uiDebugKit?.FlashComp(ref.current, {text: `Rect changed. @rc:${store.renderCount} @rect:${newRect}`});
            graph.NotifyGroupUIMoveOrResize(groupInfo.current!, newRect);
        }
        
        if (store.renderCount > 0) {
            console.log(`Rerendering @count:${store.renderCount} @width:${groupInfo.current?.rect.width} @height:${groupInfo.current?.rect.height}`);
        } else {
            console.log("First render");
        }
        /*return ()=>{
            console.log("Test2");
        };*#/
    });*/
    return { ref_childHolder, ref_group };
}
