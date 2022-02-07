import React from "react";
import {Component} from "react";
import {css, HTMLProps_Fixed} from "../../Utils/UI.js";

export type RowProps = {noShrink?, center?, style?} & HTMLProps_Fixed<"div">;
export class Row extends Component<RowProps, {}> {
	render() {
		let {noShrink, center, style, title, ...rest} = this.props;
		return <div {...rest} title={title ?? undefined} style={css(
			{display: "flex"},
			noShrink && {flexShrink: 0},
			center && {alignItems: "center"},
			style,
		)}/>
	}
}

export type ColumnProps = {noShrink?, center?, style?} & HTMLProps_Fixed<"div">;
export class Column extends Component<ColumnProps, {}> {
	render() {
		let {noShrink, center, style, title, ...rest} = this.props;
		return <div {...rest} title={title ?? undefined} style={css(
			{display: "flex", flexDirection: "column"},
			noShrink && {flexShrink: 0},
			center && {alignItems: "center"},
			style,
		)}/>
	}
}