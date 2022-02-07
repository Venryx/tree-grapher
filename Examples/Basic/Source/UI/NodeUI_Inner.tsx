import React from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";

export class NodeUI_Inner extends BaseComponent<{node: MapNode}, {}> {
	render() {
		let {node} = this.props;
		return (
			<Row style={{
				background: "rgba(0,0,0,.3)",
				border: "1px solid black",
				borderRadius: 10,
				width: 300,
				padding: 5,
			}}>
				{node.text}
			</Row>
		);
	}
}