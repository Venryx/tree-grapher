import React from "react";
import { Component } from "react";
import { css } from "../../Utils/UI.js";
export class Row extends Component {
    render() {
        let { noShrink, center, style, title, ...rest } = this.props;
        return React.createElement("div", { ...rest, title: title ?? undefined, style: css({ display: "flex" }, noShrink && { flexShrink: 0 }, center && { alignItems: "center" }, style) });
    }
}
export class Column extends Component {
    render() {
        let { noShrink, center, style, title, ...rest } = this.props;
        return React.createElement("div", { ...rest, title: title ?? undefined, style: css({ display: "flex", flexDirection: "column" }, noShrink && { flexShrink: 0 }, center && { alignItems: "center" }, style) });
    }
}
