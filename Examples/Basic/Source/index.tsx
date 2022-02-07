import React from "react";
import ReactDOM from "react-dom";
import {RootUI} from "./Root";

const mountNode = document.createElement("div");
mountNode.style.height = "100%";
document.body.appendChild(mountNode);
ReactDOM.render(<RootUI/>, mountNode);