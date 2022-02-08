import React from "react";
import { Component } from "react";
import { Column } from "./@Shared/Basics.js";
export class NodeUI_RightColumn extends Component {
    render() {
        let { children } = this.props;
        //let {ref} = useRef_nodeLeftColumn(path);
        //let rightColumnOffset = 0;
        return (React.createElement(Column
        //ref={UseCallback(c=>this.rightColumn = c, [])}
        //ref={ref}
        , { 
            //ref={UseCallback(c=>this.rightColumn = c, [])}
            //ref={ref}
            className: "rightColumn clickThrough", style: {
                position: "absolute", left: "100%",
                //top: rightColumnOffset,
                top: 0,
            } }, children));
    }
}
