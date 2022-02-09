import React, {useCallback, useContext, useEffect, useRef} from "react";
import {Component} from "react";
import {useCallbackRef} from "use-callback-ref";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {Column, Row} from "./@Shared/Basics.js";
import ReactDOM from "react-dom";
import {Assert} from "js-vextensions";
import {NodeConnectorOpts} from "./ConnectorLinesUI.js";

export function useRef_nodeLeftColumn(treePath: string, connectorLineOpts?: NodeConnectorOpts) {
	const graph = useContext(GraphContext);
	let ref_group = useRef<NodeGroup | null>(null);

	let ref_resizeObserver = useRef<ResizeObserver | null>(null);

	let ref_leftColumn = useCallbackRef<HTMLElement>(null, el=>{
	//let ref = useCallback(el=>{
		if (el) {
			let group = graph.NotifyGroupLeftColumnMount(el as any as HTMLElement, treePath, connectorLineOpts);
			ref_group.current = group;

			// set up observer
			// NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
			const resizeObserver = new ResizeObserver(entries=>{
				let entry = entries[0];
				//if (ref_leftColumn.current == null || group.IsDestroyed()) return;
				group.UpdateLCRect();

				// idk why this is needed, but it is atm
				/*let info = group.UpdateCHRect();
				// even if rect did not change, we still have to check for left-column realignment
				if (info && !info.rectChanged) {
					group.RecalculateLeftColumnAlign();
				}*/
			});
			ref_resizeObserver.current = resizeObserver;
			resizeObserver.observe(el);

			group.RecalculateLeftColumnAlign();
		} else {
			const group = ref_group.current;
			Assert(group && ref_resizeObserver.current, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
			ref_group.current = null;
			ref_resizeObserver.current!.disconnect();
			ref_resizeObserver.current = null;
			graph.NotifyGroupLeftColumnUnmount(group);
		}
	});
	//}, []);

	// also re-attach this element as the left-column every time it renders (group may have been deleted then recreated, from collapsing then expanding the node)
	/*useEffect(()=>{
		groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(ref.current as any as HTMLElement, treePath);
	});*/

	return {ref_leftColumn, ref_group};
}

export const NodeUI_LeftColumn = (props: {treePath: string, connectorLineOpts?: NodeConnectorOpts, children})=>{
	let {treePath, connectorLineOpts, children} = props;
	const graph = useContext(GraphContext);
	const group = graph.groupsByPath.get(treePath);
	let {ref_leftColumn} = useRef_nodeLeftColumn(treePath, connectorLineOpts);

	return (
		<Column
			//ref={ref}
			ref={useCallback(c=>{
				ref_leftColumn.current = ReactDOM.findDOMNode(c) as any;
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