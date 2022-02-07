import React from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";
import {NodeUI_Inner} from "./NodeUI_Inner";
import {NodeUI_LeftColumn, NodeUI_RightColumn} from "tree-grapher";

export class NodeUI extends BaseComponent<{node: MapNode, treePath: string}, {boxExpanded: boolean}> {
	static initialState = {boxExpanded: true};
	render() {
		let {node, treePath} = this.props;
		let {boxExpanded} = this.state;
		
		const {css} = cssHelper(this);
		return (
			<Row className="NodeUI" style={{
				position: "relative",
				//background: StripesCSS({angle: 0, stripeColor: "rgba(255,0,0,.2)"}),
			}}>
				<NodeUI_LeftColumn {...{treePath}}>
					<NodeUI_Inner node={node}/>
				</NodeUI_LeftColumn>
				{boxExpanded &&
				<NodeUI_RightColumn {...{treePath}}>
					<NodeChildHolder children={node.children} {...{treePath}}/>
				</NodeUI_RightColumn>}
			</Row>
		);
	}
}