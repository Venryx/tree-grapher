import { useRef } from "react";
import { useCallbackRef } from "use-callback-ref";
import { Graph } from "../Graph.js";
export function useNodeGroup(treePath) {
    /*useEffect(()=>{
        return ()=>{
        };
    });*/
    let groupInfo = useRef(null);
    let ref = useCallbackRef(null, el => {
        if (el) {
            groupInfo.current = Graph.main.NotifyNodeGroupRendered(el, treePath);
        }
        else {
            Graph.main.NotifyNodeGroupUnrendered(groupInfo.current);
            groupInfo.current = null;
        }
    });
    return { ref };
}
