import {useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {useCallbackRef} from "use-callback-ref";
import {Graph, GraphContext} from "../Graph.js";
import {Vector2, VRect, WaitXThenRun} from "js-vextensions";
import {NodeGroup} from "../Graph/NodeGroup.js";

export function useRef_nodeGroup(treePath: string) {
	const graph = useContext(GraphContext);
	let groupInfo = useRef<NodeGroup | null>(null);

	const store = useMemo(()=>({
		renderCount: 0,
		/*width: -1,
		height: -1,*/
	}), []);

	let ref = useCallbackRef<HTMLElement>(null, el=>{
	//let ref = useCallback(el=>{
		//ref2(el);
		//console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
		//console.log(`${el ? "Mount" : "Unmount"}`);

		if (el) {
			groupInfo.current = graph.NotifyGroupChildHolderMount(el as any as HTMLElement, treePath);
			groupInfo.current.RecalculateLeftColumnAlign(); // call once, for first render
			groupInfo.current.RecalculateChildHolderShift(); // call once, for first render
		} else {
			//graph.NotifyGroupUIUnmount(groupInfo.current!);
			const group = groupInfo.current!;
			group.childHolderEl = null;
			group.RecalculateLeftColumnAlign();
			groupInfo.current = null;
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

	useEffect(()=>{
		const resizeObserver = new ResizeObserver(entries=>onResize(entries[0]));
		resizeObserver.observe(ref.current!);
		function onResize(entry: ResizeObserverEntry) {
			if (ref.current == null || groupInfo.current == null) return;
			groupInfo.current.UpdateRect();
		}
		return ()=>resizeObserver.disconnect();
	}, []);

	return {ref};
}