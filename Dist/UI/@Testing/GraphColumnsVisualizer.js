import { CE, Range, Timer } from "js-vextensions";
import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { Column, Row } from "react-vcomponents";
import { GraphContext } from "../../Graph.js";
export const GraphColumnsVisualizer = observer((props) => {
    const { levelsToScrollContainer } = props;
    const graph = useContext(GraphContext);
    //const forceUpdate = useForceUpdate();
    const [height, setHeight] = useState(0);
    const ref = useRef(null);
    let [marginTopNeededToBeVisible, setMarginTopNeededToBeVisible] = useState(0);
    useEffect(() => {
        let timer = new Timer(100, () => {
            if (ref.current == null)
                return;
            if (levelsToScrollContainer != null) {
                let nextUp = ref.current;
                for (let i = 0; i < levelsToScrollContainer; i++) {
                    nextUp = nextUp === null || nextUp === void 0 ? void 0 : nextUp.parentElement;
                }
                if (nextUp instanceof HTMLElement) {
                    const deltaNeeded = nextUp.getBoundingClientRect().top - ref.current.getBoundingClientRect().top;
                    const newVal = marginTopNeededToBeVisible + deltaNeeded;
                    if (newVal != marginTopNeededToBeVisible) {
                        setMarginTopNeededToBeVisible(newVal);
                    }
                }
            }
            //forceUpdate();
            setHeight(ref.current.getBoundingClientRect().height); // this also triggers update (needed for block above)
        }).Start();
        return () => timer.Stop();
    });
    return (React.createElement("div", { ref: ref, style: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" } },
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
