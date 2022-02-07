import { useContext, useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { GraphContext } from "../Graph.js";
export function useNodeGroup(treePath) {
    const graph = useContext(GraphContext);
    let groupInfo = useRef(null);
    let ref = useCallbackRef(null, el => {
        if (el) {
            groupInfo.current = graph.NotifyNodeGroupRendered(el, treePath);
        }
        else {
            graph.NotifyNodeGroupUnrendered(groupInfo.current);
            groupInfo.current = null;
        }
    });
    return { ref };
}
