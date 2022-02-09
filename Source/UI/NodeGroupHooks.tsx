import {useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import {Graph, GraphContext} from "../Graph.js";
import {Assert, Vector2, VRect, WaitXThenRun} from "js-vextensions";
import {NodeGroup} from "../Graph/NodeGroup.js";

export function useRef_nodeGroup(treePath: string, groupBelowParent = false) {
	const graph = useContext(GraphContext);
	let ref_group = useRef<NodeGroup | null>(null);

	const store = useMemo(()=>({
		renderCount: 0,
		/*width: -1,
		height: -1,*/
	}), []);

	// I think a plain closure-var would also work, but for consistency/clarity, we'll use a ref
	//let resizeObserver: ResizeObserver;
	let ref_resizeObserver = useRef<ResizeObserver | null>(null);

	let ref_childHolder = useCallbackRef<HTMLElement>(null, el=>{
	//let ref = useCallback(el=>{
		if (groupBelowParent) return;

		//ref2(el);
		//console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
		//console.log(`${el ? "Mount" : "Unmount"}`);

		if (el) {
			let group = graph.NotifyGroupChildHolderMount(el as any as HTMLElement, treePath);
			ref_group.current = group;

			// set up observer
			const resizeObserver = new ResizeObserver(entries=>{
				let entry = entries[0];
				//if (ref_childHolder.current == null || group.IsDestroyed()) return;
				group.UpdateRect();
			});
			ref_resizeObserver.current = resizeObserver;
			resizeObserver.observe(el);

			group.RecalculateLeftColumnAlign(); // call once, for first render
			group.RecalculateChildHolderShift(); // call once, for first render
		} else {
			const group = ref_group.current;
			Assert(group && ref_resizeObserver.current, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
			ref_group.current = null;
			ref_resizeObserver.current!.disconnect();
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

	return {ref_childHolder, ref_group};
}