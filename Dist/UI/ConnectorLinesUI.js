import { Fragment, useContext, useMemo, useRef } from "react";
import React from "react";
import { Assert, E, Vector2 } from "js-vextensions";
import { GraphContext } from "../Graph.js";
import { useForceUpdate } from "../index.js";
import { useCallbackRef } from "use-callback-ref";
export function useRef_connectorLinesUI(treePath, handle) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    let ref_connectorLinesUI = useCallbackRef(null, el => {
        if (el) {
            handle.svgEl = el;
            let group = graph.NotifyGroupConnectorLinesUIMount(handle, treePath);
            ref_group.current = group;
        }
        else {
            const group = ref_group.current;
            Assert(group, "Cannot call ref_group.current = null twice in a row!");
            ref_group.current = null;
            graph.NotifyGroupConnectorLinesUIUnmount(group);
        }
    });
    return { ref_connectorLinesUI, ref_group };
}
export class NodeConnectorOpts {
}
export class ConnectorLinesUI_Handle {
    constructor(data) {
        Object.assign(this, data);
    }
}
export const ConnectorLinesUI = React.memo((props) => {
    var _a, _b;
    const { treePath, width, linesFromAbove } = props;
    const forceUpdate = useForceUpdate();
    const handle = useMemo(() => new ConnectorLinesUI_Handle({ props: props, svgEl: null, forceUpdate }), []);
    const { ref_connectorLinesUI, ref_group } = useRef_connectorLinesUI(treePath, handle);
    const group = ref_group.current;
    let linkSpawnPoint = Vector2.zero;
    let childBoxInfos = [];
    if (group && group.chRect) {
        let guessedInnerUI_marginBottom = 0;
        if (group.lcRect && group.leftColumnEl) {
            let guessedInnerUI = group.leftColumnEl ? group.leftColumnEl.childNodes[group.leftColumnEl.childNodes.length - 1] : null;
            let guessedInnerUI_rectBottom = guessedInnerUI instanceof HTMLElement ? guessedInnerUI.getBoundingClientRect().bottom : 0;
            guessedInnerUI_marginBottom = group.leftColumnEl.getBoundingClientRect().bottom - guessedInnerUI_rectBottom;
        }
        linkSpawnPoint = linesFromAbove
            ? new Vector2(20, -guessedInnerUI_marginBottom)
            : new Vector2(0, ((_b = (_a = group === null || group === void 0 ? void 0 : group.chRect) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0) / 2);
        childBoxInfos = [...group.childConnectorInfos.values()].filter(a => a.rect != null).map(entry => {
            return {
                offset: new Vector2(entry.rect.x, entry.rect.Center.y).Minus(group.chRect.Position),
                opts: entry.opts,
            };
        });
    }
    return (React.createElement("svg", { ref: ref_connectorLinesUI, className: "clickThroughChain", width: `${width}px`, height: "100%", style: {
            position: "absolute",
            //left: 0, right: 0,
            left: 0, width,
            //top: 0, bottom: 0,
            overflow: "visible", zIndex: -1
        } }, childBoxInfos.map((child, index) => {
        var _a, _b;
        if (child.offset == null)
            return null;
        const childID = `${treePath}_${index}`;
        if (linesFromAbove) {
            const start = linkSpawnPoint;
            const mid = child.offset.Minus(10, 0);
            const end = child.offset;
            return React.createElement("path", { key: `connectorLine_${childID}`, style: { stroke: (_b = (_a = child.opts) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : "gray", strokeWidth: 3, fill: "none" }, d: `M${start.x},${start.y} L${mid.x},${mid.y} L${end.x},${end.y}` });
        }
        const start = linkSpawnPoint;
        let startControl = start.Plus(30, 0);
        const end = child.offset;
        let endControl = child.offset.Plus(-30, 0);
        const middleControl = start.Plus(end).Times(0.5); // average start-and-end to get middle-control
        startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
        endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control
        const curvedLine = style => {
            var _a, _b;
            return React.createElement("path", { style: E({ stroke: (_b = (_a = child.opts) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : "gray", strokeWidth: 3, fill: "none" }, style), d: `M${start.x},${start.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${end.x},${end.y}` });
        };
        const addDash = false;
        return React.createElement(Fragment, { key: `connectorLine_${childID}` },
            curvedLine(addDash && { strokeDasharray: "10 5" }),
            addDash && curvedLine({ strokeDasharray: "5 10", strokeDashoffset: 5, stroke: `hsla(0,0%,100%,.1)` }));
    })));
});
/*export class Squiggle extends BaseComponent<{start: Vector2, startControl_offset: Vector2, end: Vector2, endControl_offset: Vector2, color: chroma.Color, usePercents?: boolean, style?}, {}> {
    render() {
        const {start, startControl_offset, end, endControl_offset, color, usePercents, style} = this.props;

        let startControl = start.Plus(startControl_offset);
        let endControl = end.Plus(endControl_offset);

        const middleControl = start.Plus(end).Times(0.5); // average start-and-end to get middle-control
        startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
        endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control

        return (
            <svg viewBox={usePercents ? "0 0 100 100" : null as any} preserveAspectRatio="none" style={E({position: "absolute", overflow: "visible", zIndex: -1}, style)}>
                <path style={ES({stroke: color.css(), strokeWidth: 3, fill: "none"}, usePercents && {vectorEffect: "non-scaling-stroke"})}
                    d={`M${start.x},${start.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${end.x},${end.y}`}/>
            </svg>
        );
    }
}*/ 
