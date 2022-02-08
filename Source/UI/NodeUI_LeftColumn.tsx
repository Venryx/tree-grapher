import React, {useCallback, useContext, useEffect, useRef} from "react";
import {Component} from "react";
import {useCallbackRef} from "use-callback-ref";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {Column, Row} from "./@Shared/Basics.js";
import ReactDOM from "react-dom";

export function useRef_nodeLeftColumn(treePath: string) {
	const graph = useContext(GraphContext);
	let groupInfo = useRef<NodeGroup | null>(null);

	let ref = useCallbackRef<HTMLElement>(null, el=>{
	//let ref = useCallback(el=>{
		if (el) {
			groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(el as any as HTMLElement, treePath);
			groupInfo.current.RecalculateLeftColumnAlign();
		} else {
			graph.NotifyGroupUIUnmount(groupInfo.current!);
			groupInfo.current = null;
		}
	});
	//}, []);

	// also re-attach this element as the left-column every time it renders (group may have been deleted then recreated, from collapsing then expanding the node)
	/*useEffect(()=>{
		groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(ref.current as any as HTMLElement, treePath);
	});*/

	useEffect(()=>{
		const resizeObserver = new ResizeObserver(entries=>onResize(entries[0]));
		resizeObserver.observe(ref.current!);
		function onResize(entry: ResizeObserverEntry) {
			if (ref.current == null || groupInfo.current == null) return;
			//groupInfo.current.RecalculateLeftColumnAlign();
			groupInfo.current.UpdateRect();
		}
		return ()=>resizeObserver.disconnect();
	}, []);

	return {ref};
}

export const NodeUI_LeftColumn = (props: {treePath: string, children})=>{
	let {treePath, children} = props;
	const graph = useContext(GraphContext);
	const group = graph.groupsByPath.get(treePath);
	let {ref} = useRef_nodeLeftColumn(treePath);

	return (
		<Column
			//ref={ref}
			ref={useCallback(c=>{
				ref.current = ReactDOM.findDOMNode(c) as any;
				//ref(c ? GetDOM(c) as any : null), [ref]);
			}, [])}
			className="innerBoxColumn clickThrough"
			style={Object.assign(
				{
					position: "relative",
					/*paddingTop: gapBeforeInnerUI,
					paddingBottom: gapAfterInnerUI,*/
				},
			)}
		>
			{children}
		</Column>
	);
}