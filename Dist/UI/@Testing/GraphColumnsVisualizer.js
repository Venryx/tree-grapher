import { CE, Range, Timer, Vector2 } from "js-vextensions";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { Column, Row } from "react-vcomponents";
import { GraphContext } from "../../Graph.js";
import { useForceUpdate } from "../../Utils/UI.js";
export const GraphColumnsVisualizer = observer((props) => {
    const { levelsToScrollContainer } = props;
    const graph = useContext(GraphContext);
    const forceUpdate = useForceUpdate();
    //const [store] = useState({mousePos: new Vector2(-1, -1)});
    const [mousePos, setMousePos] = useState(new Vector2(-1, -1));
    const [height, setHeight] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        let mouseMoveListener = (e) => {
            if (ref.current == null)
                return;
            setMousePos(new Vector2(e.clientX - ref.current.getBoundingClientRect().x, e.clientY - ref.current.getBoundingClientRect().y));
        };
        document.addEventListener("mousemove", mouseMoveListener);
        return () => document.removeEventListener("mousemove", mouseMoveListener);
    });
    let [marginTopNeededToBeVisible, setMarginTopNeededToBeVisible] = useState(0);
    useEffect(() => {
        let timer = new Timer(100, () => {
            if (ref.current == null)
                return;
            const rectTop_preMargin = ref.current.getBoundingClientRect().top;
            const newMarginTopToBeVisible_inPageViewport = 0 - rectTop_preMargin; // these rects are in viewport space, so "0" as the target-y just means top-of-viewport!
            let newMarginTopToBeVisible_inScrollContainerViewport = 0;
            if (levelsToScrollContainer != null) {
                let nextUp = ref.current;
                for (let i = 0; i < levelsToScrollContainer; i++) {
                    nextUp = nextUp === null || nextUp === void 0 ? void 0 : nextUp.parentElement;
                }
                if (nextUp instanceof HTMLElement) {
                    newMarginTopToBeVisible_inScrollContainerViewport = nextUp.getBoundingClientRect().top - rectTop_preMargin;
                }
            }
            let newMarginTopToBeVisible_inBothViewports = Math.max(newMarginTopToBeVisible_inPageViewport, newMarginTopToBeVisible_inScrollContainerViewport);
            if (newMarginTopToBeVisible_inBothViewports != marginTopNeededToBeVisible) {
                setMarginTopNeededToBeVisible(newMarginTopToBeVisible_inBothViewports);
            }
            const newHeight = ref.current.getBoundingClientRect().height;
            if (newHeight != height) {
                setHeight(newHeight);
            }
            else {
                forceUpdate();
            }
        }).Start();
        return () => timer.Stop();
    });
    return (React.createElement("div", { ref: ref, style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" } },
        mousePos.x != -1 &&
            React.createElement("div", { style: { position: "absolute", right: 0, top: 0 } }, `${mousePos.x}, ${mousePos.y} (mouse)`),
        React.createElement(Row, { style: {
                position: "absolute", left: 0, right: 0, top: marginTopNeededToBeVisible, bottom: 0,
                pointerEvents: "none",
            } }, graph.columns.map((column, index) => {
            return (React.createElement(Column, { key: index, style: { display: "inline-flex", width: 100, height: "100%", border: "solid hsla(40,100%,50%,.5)", borderWidth: "0 1px 0 0" } },
                React.createElement(Row, null,
                    "#",
                    index,
                    " C:",
                    column.groups_ordered.length)));
        })),
        React.createElement(Column, { style: {
                position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
                pointerEvents: "none",
            } }, Range(0, CE(height).CeilingTo(100), 100, false).map((rowDistFromTop, index) => {
            return (React.createElement(Row, { key: index, style: { display: "inline-flex", width: "100%", height: 100, border: "solid hsla(40,100%,50%,.5)", borderWidth: "0 0 1px 0" } }, graph.columns.map((column, columnIndex) => {
                return (React.createElement("div", { key: columnIndex, style: { display: "inline-flex", width: 100, height: 100, opacity: .5, fontSize: 11 } }, rowDistFromTop > 0 ? `${columnIndex * graph.columnWidth},${rowDistFromTop}` : ""));
            })));
        }))));
});
