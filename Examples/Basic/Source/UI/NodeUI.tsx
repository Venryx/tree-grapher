import React from "react";
import {Column, Row} from "react-vcomponents";
import {BaseComponent, cssHelper, UseCallback} from "react-vextensions";
import {MapNode} from "../@SharedByExamples/MapNode";
import {NodeChildHolder} from "./NodeChildHolder";
import {NodeUI_Inner} from "./NodeUI_Inner";

export class NodeUI extends BaseComponent<{node: MapNode}, {boxExpanded: boolean}> {
	static initialState = {boxExpanded: true};
	render() {
		let {node} = this.props;
		let {boxExpanded} = this.state;

		let gapBeforeInnerUI = 0;
		let gapAfterInnerUI = 0;
		let rightColumnOffset = 0;
		
		const {css} = cssHelper(this);
		return (
			<Row className="NodeUI" style={{position: "relative"}}>
				<Column className="innerBoxColumn clickThrough" style={css(
					{
						position: "relative",
						paddingTop: gapBeforeInnerUI,
						paddingBottom: gapAfterInnerUI,
					},
				)}>
					<NodeUI_Inner node={node}/>
				</Column>
				{boxExpanded &&
				<Column /*ref={UseCallback(c=>this.rightColumn = c, [])}*/ className="rightColumn clickThrough" style={{
					position: "absolute", left: "100%", top: rightColumnOffset,
				}}>
					<NodeChildHolder children={node.children}/>
				</Column>}
			</Row>
		);
	}
}