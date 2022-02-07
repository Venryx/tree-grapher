import React from "react";
import {Component} from "react";
import {Column, Row} from "./@Shared/Basics.js";

export class NodeUI_RightColumn extends Component<{children}, {}> {
	render() {
		let {children} = this.props;

		let rightColumnOffset = 0;

		return (
			<Column /*ref={UseCallback(c=>this.rightColumn = c, [])}*/ className="rightColumn clickThrough" style={{
				position: "absolute", left: "100%", top: rightColumnOffset,
			}}>
				{children}
			</Column>
		);
	}
}