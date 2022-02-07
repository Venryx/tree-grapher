import React from "react";
import {Button, Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, GetDOM, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeUI} from "./NodeUI";
import {useNodeGroup} from "tree-grapher";
import {StripesCSS, useForceUpdate} from "../@SharedByExamples/Utils/General";

export function NodeChildHolder(props: {children: MapNode[], treePath: string}) {
	let {children, treePath} = props;
	const forceUpdate = useForceUpdate();
	let {ref} = useNodeGroup(treePath);

	const {css} = cssHelper({constructor: NodeChildHolder} as any);
	return (
		<Column
			ref={c=>{
				ref.current = GetDOM(c) as any;
			}}
			className="NodeChildHolder clickThrough"
			style={css(
				{
					position: "relative",
					marginLeft: 30,
					background: StripesCSS({angle: 10, stripeColor: "rgba(255,150,0,.5)"}),
				},
			)}
		>
			<Button text="U" title="Update NodeChildHolder"
				style={{position: "absolute", left: -30, top: `calc(50% - 15px)`, width: 30, height: 30}}
				onClick={()=>forceUpdate()}/>
			{children.map((child, index)=>{
				return <NodeUI key={index} node={child} {...{treePath: `${treePath}/${index}`}}/>;
			})}
		</Column>
	);
}