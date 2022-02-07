import React from "react";
import { Component } from "react";
import { Column } from "./@Shared/Basics.js";
export class NodeUI_LeftColumn extends Component {
    render() {
        let { children } = this.props;
        let gapBeforeInnerUI = 0;
        let gapAfterInnerUI = 0;
        return (React.createElement(Column, { className: "innerBoxColumn clickThrough", style: Object.assign({
                position: "relative",
                paddingTop: gapBeforeInnerUI,
                paddingBottom: gapAfterInnerUI,
            }) }, children));
    }
}
