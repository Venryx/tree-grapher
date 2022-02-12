import {Component, Fragment, Ref, RefObject, useContext, useMemo, useRef} from "react";
import React from "react";
import {Assert, E, Vector2} from "js-vextensions";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {useForceUpdate} from "../index.js";
import {useCallbackRef} from "use-callback-ref";
import {GetPaddingTopFromStyle} from "../Utils/General/General.js";
import {n} from "../Utils/@Internal/Types.js";

export function useRef_connectorLinesUI(treePath: string, handle: ConnectorLinesUI_Handle) {
	const graph = useContext(GraphContext);
	let ref_group = useRef<NodeGroup | null>(null);

	let ref_connectorLinesUI = useCallbackRef<SVGSVGElement>(null, el=>{
		if (el) {
			handle.svgEl = el;
			let group = graph.NotifyGroupConnectorLinesUIMount(handle, treePath);
			ref_group.current = group;
		} else {
			const group = ref_group.current;
			Assert(group, "Cannot call ref_group.current = null twice in a row!");
			ref_group.current = null;
			graph.NotifyGroupConnectorLinesUIUnmount(group);
		}
	});

	return {ref_connectorLinesUI, ref_group};
}

export class NodeConnectorOpts {
	color?: string;
}

export type ChildBoxInfo_AtRenderTime = {
	offset: Vector2;
	opts: NodeConnectorOpts|n,
};

export class ConnectorLinesUI_Handle {
	constructor(data: ConnectorLinesUI_Handle) {
		Object.assign(this, data);
	}
	props: React.PropsWithoutRef<typeof ConnectorLinesUI>;
	svgEl: SVGSVGElement; // maybe rework this
	forceUpdate: ()=>void;
}

export const ConnectorLinesUI = React.memo((props: {treePath: string, width: number, linesFromAbove?: boolean})=>{
	const {treePath, width, linesFromAbove} = props;
	const forceUpdate = useForceUpdate();

	const handle = useMemo(()=>new ConnectorLinesUI_Handle({props: props as any, svgEl: null as any, forceUpdate}), []);
	const {ref_connectorLinesUI, ref_group} = useRef_connectorLinesUI(treePath, handle);
	const group = ref_group.current;

	let linkSpawnPoint = Vector2.zero;
	let childBoxInfos: ChildBoxInfo_AtRenderTime[] = [];
	if (group && group.chRect && group.ChildHolderAnchorPoint({from: "ConnectorLinesUI"}) != null) {
		let guessedInnerUI_marginBottom = 0;
		if (group.lcRect && group.leftColumnEl) {
			let guessedInnerUI = group.leftColumnEl ? group.leftColumnEl.childNodes[group.leftColumnEl.childNodes.length - 1] : null;
			let guessedInnerUI_rectBottom = guessedInnerUI instanceof HTMLElement ? guessedInnerUI.getBoundingClientRect().bottom : 0;
			guessedInnerUI_marginBottom = group.leftColumnEl.getBoundingClientRect().bottom - guessedInnerUI_rectBottom;
		}
		
		linkSpawnPoint = linesFromAbove
			? new Vector2(width - 10, -guessedInnerUI_marginBottom)
			: new Vector2(0, group.ConvertFromGlobalSpace_YPos(group.ChildHolderAnchorPoint({from: "ConnectorLinesUI"})!, group.chRect));
		childBoxInfos = [...group.childConnectorInfos.values()].filter(a=>a.rect != null).map(entry=>{
			return {
				offset: new Vector2(entry.rect!.x, entry.rect!.Center.y).Minus(group.chRect!.Position),
				opts: entry.opts,
			};
		});
	}

	return (
		<svg ref={ref_connectorLinesUI} className="clickThroughChain" width={`${width}px`} height="100%" style={{
			position: "absolute",
			//left: 0, right: 0,
			left: 0, width,
			//top: 0, bottom: 0,
			overflow: "visible", zIndex: -1
		}}>
			{childBoxInfos.map((child, index)=>{
				if (child.offset == null) return null;
				const childID = `${treePath}_${index}`;

				if (linesFromAbove) {
					const start = linkSpawnPoint;
					const mid = child.offset.Minus(10, 0);
					const end = child.offset;
					return <path key={`connectorLine_${childID}`} style={{stroke: child.opts?.color ?? "gray", strokeWidth: 3, fill: "none"}}
						d={`M${start.x},${start.y} L${mid.x},${mid.y} L${end.x},${end.y}`}/>;
				}

				const start = linkSpawnPoint;
				let startControl = start.Plus(30, 0);
				const end = child.offset;
				let endControl = child.offset.Plus(-30, 0);

				const middleControl = start.Plus(end).Times(0.5); // average start-and-end to get middle-control
				startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
				endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control

				const curvedLine = style=>{
					return <path //key={`connectorLine_${child.id}`}
						style={E(
							{stroke: child.opts?.color ?? "gray", strokeWidth: 3, fill: "none"},
							style,
						)}
						d={`M${start.x},${start.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${end.x},${end.y}`}/>;
				};

				const addDash = false;
				return <Fragment key={`connectorLine_${childID}`}>
					{curvedLine(addDash && {strokeDasharray: "10 5"})}
					{addDash && curvedLine({strokeDasharray: "5 10", strokeDashoffset: 5, stroke: `hsla(0,0%,100%,.1)`})}
				</Fragment>;
			})}
		</svg>
	);
});


/*export class Squiggle extends BaseComponent<{start: Vector2, startControl_offset: Vector2, end: Vector2, endControl_offset: Vector2, color: chroma.Color, usePercents?: boolean, style?}, {}> {
	render() {
		const {start, startControl_offset, end, endControl_offset, color, usePercents, style} = this.props;

		let startControl = start.Plus(startControl_offset);
		let endControl = end.Plus(endControl_offset);

		const middleControl = start.Plus(end).Times(0.5); // average start-and-end to get middle-control
		startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
		endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control

		return (
			<svg viewBox={usePercents ? "0 0 100 100" : null as any} preserveAspectRatio="none" style={E({position: "absolute", overflow: "visible", zIndex: -1}, style)}>
				<path style={ES({stroke: color.css(), strokeWidth: 3, fill: "none"}, usePercents && {vectorEffect: "non-scaling-stroke"})}
					d={`M${start.x},${start.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${end.x},${end.y}`}/>
			</svg>
		);
	}
}*/