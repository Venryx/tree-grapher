import React from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeUI} from "./NodeUI";

export class NodeChildHolder extends BaseComponent<{children: MapNode[]}, {}> {
	render() {
		let {children} = this.props;

		const {css} = cssHelper(this);
		return (
			<Column className="NodeChildHolder clickThrough" style={css(
				{
					position: "relative",
					marginLeft: 30,
				},
			)}>
				{children.map((child, index)=>{
					return <NodeUI key={index} node={child}/>;
				})}
			</Column>
		);
	}
}