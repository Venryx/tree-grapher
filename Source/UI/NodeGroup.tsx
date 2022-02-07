import {useEffect, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import {NodeGroupInfo, Graph} from "../Graph.js";

export function useNodeGroup(treePath: string) {
	/*useEffect(()=>{
		return ()=>{
		};
	});*/
	let groupInfo = useRef<NodeGroupInfo | null>(null);

	let ref = useCallbackRef(null, el=>{
		if (el) {
			groupInfo.current = Graph.main.NotifyNodeGroupRendered(el as any as HTMLElement, treePath);
		} else {
			Graph.main.NotifyNodeGroupUnrendered(groupInfo.current!);
			groupInfo.current = null;
		}
	});
	return {ref};
}