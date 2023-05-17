import {Assert, CE, ToNumber, Vector2} from "js-vextensions";
import React, {useCallback, useContext, useMemo, useRef} from "react";
import ReactDOM from "react-dom";
import {useCallbackRef} from "use-callback-ref";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {GetRectRelative} from "../Utils/General/General.js";
import {NodeConnectorOpts} from "./ConnectorLinesUI.js";

export function useRef_nodeLeftColumn(treePath: string, nodeConnectorOpts?: NodeConnectorOpts, userData: Object = {}, alignWithParent?: boolean) {
	nodeConnectorOpts = useMemo(
		()=>Object.assign(new NodeConnectorOpts(), nodeConnectorOpts),
		//[nodeConnectorOpts],
		// memoize based on json-representation of node-connector-opts; this way, layout system is robust to caller failing to memoize the object it passes in
		[JSON.stringify(nodeConnectorOpts)], // eslint-disable-line
	);
	userData = useMemo(
		()=>({...userData}),
		// memoize based on json-representation of user-data; this way, layout system is robust to caller failing to memoize the object it passes in
		[JSON.stringify(userData)], // eslint-disable-line
	);

	const graph = useContext(GraphContext);
	const ref_group = useRef<NodeGroup | null>(null);

	const ref_resizeObserver = useRef<ResizeObserver | null>(null);

	const ref_leftColumn_storage = useRef<HTMLElement>();
	const ref_leftColumn = useCallback(el=>{
		ref_leftColumn_storage.current = el;
		if (el) {
			const group = graph.NotifyGroupLeftColumnMount(el as any as HTMLElement, treePath, nodeConnectorOpts!, userData, alignWithParent);
			ref_group.current = group;

			const updateGroupRects = ()=>{
				if (group.leftColumnEl && group.graph.containerEl) {
					group.lcSize = GetRectRelative(group.leftColumnEl, group.graph.containerEl).Size;
					// undo any map-level scaling; we want to operate on the "unscaled" size (since whatever tree-grapher outputs will be scaled back up "at the end" using the css-transform)
					const scaleMatch = group.graph.containerEl.style.transform.match(/scale\((.*?)\)/);
					if (scaleMatch != null) {
						group.lcSize = group.lcSize.DividedBy(ToNumber(scaleMatch[1]));
					}
				} else {
					group.lcSize = null;
				}
				group.innerUISize = group.leftColumnEl && group.lcSize ? new Vector2(group.lcSize.x - group.GutterWidth, group.lcSize.y) : null;
			};
			// call once at start (atm needed to avoid rare case where element is attached, but rects aren't, and filter in children-func fails fsr)
			updateGroupRects();

			// until layout is run, set a style that makes the element non-visible
			graph.layoutOpts.styleSetter_layoutPending?.(el.style);

			// clear these things, since we have a new left-column
			group.leftColumnEl_layoutCount = 0;
			// todo: maybe have these cleared
			/*group.lcRect_atLastRender = null;
			group.innerUIRect_atLastRender = null;*/

			// set up observer
			// NOTE: ResizeObserver watches only for content-rect changes, *not* margin/padding changes (see: https://web.dev/resize-observer)
			const resizeObserver = new ResizeObserver(entries=>{
				const entry = entries[0];
				if (group.IsDestroyed()) {
					console.warn("group.IsDestroyed() returned true in left-column resizer-observer; this should not happen. Did you forget to wrap your usage of `ref_leftColumn` in a useCallback hook?");
					return;
				}

				//group.graph.uiDebugKit?.FlashComp(group.leftColumnEl, {text: `LC_ResizeObs change. @bboxSize:${ROSizeArrToStr(entry.borderBoxSize)} @cboxSize:${ROSizeArrToStr(entry.contentBoxSize)} @rect:${JSON.stringify(entry.contentRect)}`});
				/*new Wave(graph, group, [
					new MyLCResized({me: group, sender_extra: "LCResizeObs", newSize: VRect.FromLTWH(entry.contentRect).Size}),
				]).Down_StartWave();*/

				//group.UpdateLCRect();
				updateGroupRects();

				graph.RunLayout_InAMoment();
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
	}, [alignWithParent, graph, nodeConnectorOpts, userData, treePath]);

	// also re-attach this element as the left-column every time it renders (group may have been deleted then recreated, from collapsing then expanding the node)
	/*useEffect(()=>{
		groupInfo.current = graph.NotifyGroupLeftColumnMountOrRender(ref.current as any as HTMLElement, treePath);
	});*/

	return {ref_leftColumn_storage, ref_leftColumn, ref_group};
}

/** Note: Generally, it's recommended to use the "useRef_nodeLeftColumn" hook rather than this alternative. */
export const NodeUI_LeftColumn = (props: {treePath: string, nodeConnectorOpts?: NodeConnectorOpts, userData?: Object, alignWithParent?: boolean, children})=>{
	let {treePath, nodeConnectorOpts, userData, alignWithParent, children} = props;
	nodeConnectorOpts = Object.assign(new NodeConnectorOpts(), nodeConnectorOpts);

	const graph = useContext(GraphContext);
	const group = graph.groupsByPath.get(treePath);
	const gutterWidth = nodeConnectorOpts.gutterWidth + (nodeConnectorOpts.parentIsAbove ? nodeConnectorOpts.parentGutterWidth : 0); // rather than wait for group, just recalc gutter-width manually
	const {ref_leftColumn} = useRef_nodeLeftColumn(treePath, nodeConnectorOpts, userData, alignWithParent);

	return (
		<div ref={ref_leftColumn}
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
};