import React, {useCallback} from "react";
import {Button, Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, GetDOM, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeUI} from "./NodeUI";
import {ConnectorLinesUI, StripesCSS, useForceUpdate, useRef_nodeChildHolder} from "tree-grapher";
import {FlashComp} from "ui-debug-kit";
import {WaitXThenRun} from "js-vextensions";

export function NodeChildHolder(props: {children: MapNode[], childrenBelow?: boolean, path: string}) {
	let {children, childrenBelow, path} = props;
	const forceUpdate = useForceUpdate();
	let {ref_childHolder} = useRef_nodeChildHolder(path, childrenBelow);

	/*WaitXThenRun(0, ()=>{
		if (ref.current) FlashComp(ref.current, {text: "Rendering"});
	});*/

	const {css} = cssHelper({constructor: NodeChildHolder} as any);
	return (
		<>
			{/*<Column
				ref={useCallback(c=>{
					ref_childHolder.current = GetDOM(c) as any;
					//ref(c ? GetDOM(c) as any : null), [ref]);
				}, [])}
				className="NodeChildHolder clickThrough"
				style={css(
					{
						position: "relative",
						paddingLeft: 30,
						//padding: 10,
						background: StripesCSS({angle: (path.split("/").length - 1) * 45, stripeColor: "rgba(255,150,0,.5)"}),
					},
				)}
			>
				<Button text="U" title="Update NodeChildHolder"
					style={{position: "absolute", left: 0, top: `calc(50% - 15px)`, width: 30, height: 30}}
					onClick={()=>forceUpdate()}/>
				</Column>*/}
			{children.map((child, index)=>{
				return <NodeUI key={index} node={child} inBelowGroup={childrenBelow} {...{path: `${path}/${index}`}}/>;
			})}
		</>
	);
}