import React, {useCallback} from "react";
import {Button, Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, GetDOM, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeUI} from "./NodeUI";
import {useNodeGroup} from "tree-grapher";
import {StripesCSS, useForceUpdate} from "../@SharedByExamples/Utils/General";
import {FlashComp} from "ui-debug-kit";
import {WaitXThenRun} from "js-vextensions";

export function NodeChildHolder(props: {children: MapNode[], path: string}) {
	let {children, path} = props;
	const forceUpdate = useForceUpdate();
	let {ref} = useNodeGroup(path);

	WaitXThenRun(0, ()=>{
		if (ref.current) FlashComp(ref.current, {text: "TODO"});
	});

	const {css} = cssHelper({constructor: NodeChildHolder} as any);
	return (
		<Column
			ref={useCallback(c=>{
				ref.current = GetDOM(c) as any;
				//ref(c ? GetDOM(c) as any : null), [ref]);
			}, [])}
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
				return <NodeUI key={index} node={child} {...{path: `${path}/${index}`}}/>;
			})}
		</Column>
	);
}