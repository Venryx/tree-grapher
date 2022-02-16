import {Component, Fragment, Ref, RefObject, useContext, useMemo, useRef} from "react";
import React from "react";
import {Assert, E, Vector2} from "js-vextensions";
import {GraphContext} from "../Graph.js";
import {NodeGroup} from "../Graph/NodeGroup.js";
import {useForceUpdate} from "../index.js";
import {useCallbackRef} from "use-callback-ref";
import {GetPaddingTopFromStyle} from "../Utils/General/General.js";
import {n} from "../Utils/@Internal/Types.js";

export function useRef_connectorLinesUI(handle: ConnectorLinesUI_Handle) {
	const graph = useContext(GraphContext);

	let ref_connectorLinesUI = useCallbackRef<SVGSVGElement>(null, el=>{
		if (el) {
			handle.svgEl = el;
			graph.NotifyGroupConnectorLinesUIMount(handle);
		} else {
			graph.NotifyGroupConnectorLinesUIUnmount();
		}
	});

	return {ref_connectorLinesUI, graph};
}

export class NodeConnectorOpts {
	gutterWidth = 30;
	parentGutterWidth = 30; // temp; needed for show-below-parent children (since parent's ui might not be fully attached when child need's parent's gutter-width info)
	parentIsAbove?: boolean;
	color?: string;
}

export class ConnectorLinesUI_Handle {
	constructor(data: ConnectorLinesUI_Handle) {
		Object.assign(this, data);
	}
	props: React.PropsWithoutRef<typeof ConnectorLinesUI>;
	svgEl: SVGSVGElement; // maybe rework this
	forceUpdate: ()=>void;
}

export const ConnectorLinesUI = React.memo((props: {})=>{
	const forceUpdate = useForceUpdate();

	const handle = useMemo(()=>new ConnectorLinesUI_Handle({props: props as any, svgEl: null as any, forceUpdate}), []);
	const {ref_connectorLinesUI, graph} = useRef_connectorLinesUI(handle);

	const nonRootGroups = [...graph.groupsByPath.values()].filter(a=>a.path_parts.length > 1);
	return (
		<svg ref={ref_connectorLinesUI} className="clickThroughChain" width="100%" height="100%" style={{
			position: "absolute",
			left: 0, right: 0,
			top: 0, bottom: 0,
			overflow: "visible", zIndex: -1
		}}>
			{nonRootGroups.map((group, index)=>{
				if (group.innerUIRect_atLastRender == null) return null;
				const lineOpts = group.leftColumn_connectorOpts;
				if (lineOpts == null) return null;
				const lineFromAbove = lineOpts.parentIsAbove;
				const parentGroup = graph.FindParentGroup(group);
				if (parentGroup?.innerUIRect_atLastRender == null) return null;
				
				const lineStart = lineFromAbove
					? new Vector2(group.innerUIRect_atLastRender.x - (lineOpts.gutterWidth / 2), parentGroup.innerUIRect_atLastRender.Bottom)
					: new Vector2(parentGroup.innerUIRect_atLastRender.Right, parentGroup.innerUIRect_atLastRender.Center.y);
				const lineEnd = new Vector2(group.innerUIRect_atLastRender.x, group.innerUIRect_atLastRender.Center.y);

				const childID = `${group.path}_${index}`;
				if (lineFromAbove) {
					const lineMid = lineEnd.Minus(lineOpts.gutterWidth / 2, 0);
					return <path key={`connectorLine_${childID}`} style={{stroke: group.leftColumn_connectorOpts?.color ?? "gray", strokeWidth: 3, fill: "none"}}
						d={`M${lineStart.x},${lineStart.y} L${lineMid.x},${lineMid.y} L${lineEnd.x},${lineEnd.y}`}/>;
				}

				let startControl = lineStart.Plus(30, 0);
				let endControl = lineEnd.Plus(-30, 0);

				const middleControl = lineStart.Plus(lineEnd).Times(0.5); // average start-and-end to get middle-control
				startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
				endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control

				const curvedLine = style=>{
					return <path //key={`connectorLine_${child.id}`}
						style={E(
							{stroke: lineOpts.color ?? "gray", strokeWidth: 3, fill: "none"},
							style,
						)}
						d={`M${lineStart.x},${lineStart.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${lineEnd.x},${lineEnd.y}`}/>;
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