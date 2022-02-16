import {Assert} from "js-vextensions";
import {useContext, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";

export function useRef_nodeChildHolder(treePath: string, belowParent = false) {
	const graph = useContext(GraphContext);
	let ref_group = useRef<NodeGroup | null>(null);

	let ref_childHolder = useCallbackRef<HTMLElement>(null, el=>{
		if (el) {
			let group = graph.NotifyGroupChildHolderMount(el as any as HTMLElement, treePath, belowParent);
			ref_group.current = group;
		} else {
			const group = ref_group.current;
			Assert(group, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
			ref_group.current = null;
			graph.NotifyGroupChildHolderUnmount(group);
		}
	});

	return {ref_childHolder, ref_group};
}