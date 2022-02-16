import { Assert } from "js-vextensions";
import { useContext, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
export function useRef_nodeChildHolder(treePath, belowParent = false) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    let ref_childHolder = useCallbackRef(null, el => {
        if (el) {
            let group = graph.NotifyGroupChildHolderMount(el, treePath, belowParent);
            ref_group.current = group;
        }
        else {
            const group = ref_group.current;
            Assert(group, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
            ref_group.current = null;
            graph.NotifyGroupChildHolderUnmount(group);
        }
    });
    return { ref_childHolder, ref_group };
}
