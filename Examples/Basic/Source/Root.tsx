import React from "react";
import {BaseComponent} from "react-vextensions";
import {Column, Row} from "react-vcomponents";
import {NodeUI} from "./UI/NodeUI";
import {nodeTree_main} from "./@SharedByExamples/NodeData";

export class RootUI extends BaseComponent<{}, {}> {
	render() {
		let {} = this.props;
		return (
			<Column style={{height: "100%"}}>
				<Row style={{
					height: 30,
					background: "rgba(0,0,0,.3)",
					border: "solid black", borderWidth: "0 0 1px 0",
				}}>
					Toolbar
				</Row>
				<Row style={{height: "calc(100% - 30px)", padding: 5}}>
					<NodeUI node={nodeTree_main}/>
				</Row>
			</Column>
		);
	}
}