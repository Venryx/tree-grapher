import {useCallback, useContext, useEffect, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import useResizeObserver from "use-resize-observer";
import {NodeGroupInfo, Graph, GraphContext} from "../Graph.js";

export function useNodeGroup(treePath: string) {
	const graph = useContext(GraphContext);
	let groupInfo = useRef<NodeGroupInfo | null>(null);

	//const {ref: ref2, width = -1, height = -1} = useResizeObserver();

	let ref = useCallbackRef(null, el=>{
	//let ref = useCallback(el=>{
		//ref2(el);
		//console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
		console.log(`${el ? "Mount" : "Unmount"}`);

		if (el) {
			groupInfo.current = graph.NotifyGroupUIMount(el as any as HTMLElement, treePath);
		} else {
			graph.NotifyGroupUIUnmount(groupInfo.current!);
			groupInfo.current = null;
		}
	});
	//}, []);

	useEffect(()=>{
		console.log("Test1");
		return ()=>{
			console.log("Test2");
		};
	})

	return {ref};
}