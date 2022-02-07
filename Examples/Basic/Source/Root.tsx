import React from "react";
import {BaseComponent} from "react-vextensions";
import {Column, Row} from "react-vcomponents";

export class RootUI extends BaseComponent<{}, {}> {
	render() {
		let {} = this.props;
		return (
			<Column style={{height: "100%"}}>
				<Row style={{height: 30, background: "rgba(0,0,0,.5)"}}>
					Toolbar
				</Row>
				<Row style={{height: "calc(100% - 30px)"}}>
					Map
				</Row>
			</Column>
		);
	}
}