import { useContext, useEffect, useMemo, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
import { VRect } from "js-vextensions";
export function useNodeGroup(treePath) {
    const graph = useContext(GraphContext);
    let groupInfo = useRef(null);
    const store = useMemo(() => ({
        renderCount: 0,
        /*width: -1,
        height: -1,*/
    }), []);
    let ref = useCallbackRef(null, el => {
        //let ref = useCallback(el=>{
        //ref2(el);
        //console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
        console.log(`${el ? "Mount" : "Unmount"}`);
        if (el) {
            groupInfo.current = graph.NotifyGroupUIMount(el, treePath);
        }
        else {
            graph.NotifyGroupUIUnmount(groupInfo.current);
            groupInfo.current = null;
        }
    });
    //}, []);
    useEffect(() => {
        var _a, _b, _c, _d, _e;
        store.renderCount++;
        const newRect = VRect.FromLTWH(ref.current.getBoundingClientRect());
        const rectChanged = !newRect.Equals((_a = groupInfo.current) === null || _a === void 0 ? void 0 : _a.rect);
        //Object.assign(store, {width: newWidth, height: newHeight});
        (_b = graph.uiDebugKit) === null || _b === void 0 ? void 0 : _b.FlashComp(ref.current, { text: `Rendering... @rc:${store.renderCount} @rect:${newRect}` });
        // if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
        if (rectChanged) {
            (_c = graph.uiDebugKit) === null || _c === void 0 ? void 0 : _c.FlashComp(ref.current, { text: `Rect changed. @rc:${store.renderCount} @rect:${newRect}` });
            graph.NotifyGroupUIMoveOrResize(groupInfo.current, newRect);
        }
        if (store.renderCount > 0) {
            console.log(`Rerendering @count:${store.renderCount} @width:${(_d = groupInfo.current) === null || _d === void 0 ? void 0 : _d.rect.width} @height:${(_e = groupInfo.current) === null || _e === void 0 ? void 0 : _e.rect.height}`);
        }
        else {
            console.log("First render");
        }
        /*return ()=>{
            console.log("Test2");
        };*/
    });
    return { ref };
}
