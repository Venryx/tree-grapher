import {useContext, useEffect, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import {NodeGroupInfo, Graph, GraphContext} from "../Graph.js";

export function useNodeGroup(treePath: string) {
	const graph = useContext(GraphContext);
	let groupInfo = useRef<NodeGroupInfo | null>(null);

	let ref = useCallbackRef(null, el=>{
		if (el) {
			groupInfo.current = graph.NotifyNodeGroupRendered(el as any as HTMLElement, treePath);
		} else {
			graph.NotifyNodeGroupUnrendered(groupInfo.current!);
			groupInfo.current = null;
		}
	});
	return {ref};
}