import { Component } from "react";
import { HTMLProps_Fixed } from "../../Utils/UI.js";
export type RowProps = {
    noShrink?: any;
    center?: any;
    style?: any;
} & HTMLProps_Fixed<"div">;
export declare class Row extends Component<RowProps, {}> {
    render(): JSX.Element;
}
export type ColumnProps = {
    noShrink?: any;
    center?: any;
    style?: any;
} & HTMLProps_Fixed<"div">;
export declare class Column extends Component<ColumnProps, {}> {
    render(): JSX.Element;
}
