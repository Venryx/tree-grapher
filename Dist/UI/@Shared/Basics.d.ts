import { Component } from "react";
import { HTMLProps_Fixed } from "../../Utils/UI.js";
export declare type RowProps = {
    noShrink?: any;
    center?: any;
    style?: any;
} & HTMLProps_Fixed<"div">;
export declare class Row extends Component<RowProps, {}> {
    render(): JSX.Element;
}
export declare type ColumnProps = {
    noShrink?: any;
    center?: any;
    style?: any;
} & HTMLProps_Fixed<"div">;
export declare class Column extends Component<ColumnProps, {}> {
    render(): JSX.Element;
}
