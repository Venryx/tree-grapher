import {Assert, Vector2} from "js-vextensions";
import React, {useCallback, useContext, useRef} from "react";
import ReactDOM from "react-dom";
import {useCallbackRef} from "use-callback-ref";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {GetRectRelative} from "../Utils/General/General.js";
import {NodeConnectorOpts} from "./ConnectorLinesUI.js";

export function useRef_nodeLeftColumn(treePath: string, nodeConnectorOpts?: NodeConnectorOpts, alignWithParent?: boolean) {
	nodeConnectorOpts = Object.assign(new NodeConnectorOpts(), nodeConnectorOpts);
	
	const graph = useContext(GraphContext);
	let ref_group = useRef<NodeGroup | null>(null);

	let ref_resizeObserver = useRef<ResizeObserver | null>(null);

	let ref_leftColumn = useCallbackRef<HTMLElement>(null, el=>{
	//let ref = useCallback(el=>{
		if (el) {
			let group = graph.NotifyGroupLeftColumnMount(el as any as HTMLElement, treePath, nodeConnectorOpts!, alignWithParent);
			ref_group.current = group;

			// set up observer
			// NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
			const resizeObserver = new ResizeObserver(entries=>{
				let entry = entries[0];
				if (group.IsDestroyed()) {
					console.warn("group.IsDestroyed() returned true in left-column resizer-observer; this should not happen. Did you forget to wrap your usage of `ref_leftColumn` in a useCallback hook?");
					return;
				}

				//group.graph.uiDebugKit?.FlashComp(group.leftColumnEl, {text: `LC_ResizeObs change. @bboxSize:${ROSizeArrToStr(entry.borderBoxSize)} @cboxSize:${ROSizeArrToStr(entry.contentBoxSize)} @rect:${JSON.stringify(entry.contentRect)}`});
				/*new Wave(graph, group, [
					new MyLCResized({me: group, sender_extra: "LCResizeObs", newSize: VRect.FromLTWH(entry.contentRect).Size}),
				]).Down_StartWave();*/

				//group.UpdateLCRect();
				group.lcSize = group.leftColumnEl ? GetRectRelative(group.leftColumnEl, group.graph.containerEl).Size : null;
				group.innerUISize = group.leftColumnEl && group.lcSize ? new Vector2(group.lcSize.x - group.GutterWidth, group.lcSize.y) : null;

				setTimeout(()=>graph.RunLayout());
			});
			ref_resizeObserver.current = resizeObserver;
			resizeObserver.observe(el);

			//group.RecalculateLeftColumnAlign({from: "ref_leftColumn"});
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

export const NodeUI_LeftColumn = (props: {treePath: string, nodeConnectorOpts?: NodeConnectorOpts, alignWithParent?: boolean, children})=>{
	let {treePath, nodeConnectorOpts, alignWithParent, children} = props;
	nodeConnectorOpts = Object.assign(new NodeConnectorOpts(), nodeConnectorOpts);

	const graph = useContext(GraphContext);
	const group = graph.groupsByPath.get(treePath);
	const gutterWidth = nodeConnectorOpts.gutterWidth + (nodeConnectorOpts.parentIsAbove ? nodeConnectorOpts.parentGutterWidth : 0); // rather than wait for group, just recalc gutter-width manually
	let {ref_leftColumn} = useRef_nodeLeftColumn(treePath, nodeConnectorOpts, alignWithParent);

	return (
		<div
			//ref={ref}
			ref={useCallback(c=>{
				ref_leftColumn.current = ReactDOM.findDOMNode(c) as any;
				//ref(c ? GetDOM(c) as any : null), [ref]);
			}, [])}
			className="innerBoxColumn clickThrough"
			style={Object.assign(
				//!nodeConnectorOpts.parentIsAbove && {position: "absolute"} as const,
				{position: "absolute"} as const,
				//{marginLeft: nodeConnectorOpts.gutterWidth},
				//{paddingLeft: nodeConnectorOpts.gutterWidth + (group && nodeConnectorOpts.parentIsAbove ? graph.FindParentGroup(group)?.leftColumn_connectorOpts.gutterWidth ?? 0 : 0)},
				{paddingLeft: gutterWidth},
				/*!nodeConnectorOpts.parentIsAbove && {marginLeft: nodeConnectorOpts.gutterWidth},
				nodeConnectorOpts.parentIsAbove && {paddingLeft: nodeConnectorOpts.gutterWidth},*/
			)}
		>
			{children}
		</div>
	);
}