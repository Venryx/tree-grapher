import { useContext, useEffect, useMemo, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
export function useNodeGroup(treePath, uiDebugKit) {
    const graph = useContext(GraphContext);
    let groupInfo = useRef(null);
    //const {ref: ref2, width = -1, height = -1} = useResizeObserver();
    const store = useMemo(() => ({
        renderCount: 0,
        width: -1,
        height: -1,
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
        store.renderCount++;
        store.width = ref.current.getBoundingClientRect().width;
        store.height = ref.current.getBoundingClientRect().height;
        uiDebugKit === null || uiDebugKit === void 0 ? void 0 : uiDebugKit.FlashComp(ref.current, { text: `@c:${store.renderCount} @w:${store.width} @h:${store.height}` });
        if (store.renderCount > 0) {
            console.log(`Rerendering @count:${store.renderCount} @width:${store.width} @height:${store.height}`);
        }
        else {
            console.log("First render");
        }
        return () => {
            console.log("Test2");
        };
    });
    return { ref };
}
