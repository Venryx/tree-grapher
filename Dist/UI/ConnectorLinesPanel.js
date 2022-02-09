import { Fragment, useContext, useRef } from "react";
import React from "react";
import { E, Vector2 } from "js-vextensions";
import { GraphContext } from "../Graph.js";
export function useRef_connectorLinesPanel(treePath) {
    const graph = useContext(GraphContext);
    let ref_group = useRef(null);
    let ref_connectorLinesPanel = useCallbackRef(null, el => {
        //let ref = useCallback(el=>{
        if (groupBelowParent)
            return;
        //ref2(el);
        //console.log(`${el ? "Mount" : "Unmount"} @wh:`, width, height);
        //console.log(`${el ? "Mount" : "Unmount"}`);
        if (el) {
            let group = graph.NotifyGroupChildHolderMount(el, treePath);
            ref_group.current = group;
            // set up observer
            const resizeObserver = new ResizeObserver(entries => {
                let entry = entries[0];
                //if (ref_childHolder.current == null || group.IsDestroyed()) return;
                group.UpdateRect();
            });
            ref_resizeObserver.current = resizeObserver;
            resizeObserver.observe(el);
            group.RecalculateLeftColumnAlign(); // call once, for first render
            group.RecalculateChildHolderShift(); // call once, for first render
        }
        else {
            const group = ref_group.current;
            Assert(group && ref_resizeObserver.current, "Cannot call [ref_group/ref_resizeObserver].current = null twice in a row!");
            ref_group.current = null;
            ref_resizeObserver.current.disconnect();
            ref_resizeObserver.current = null;
            graph.NotifyGroupChildHolderUnmount(group);
        }
    });
    //}, []);
    /*useEffect(()=>{
        store.renderCount++;
        const newRect = VRect.FromLTWH(ref.current!.getBoundingClientRect());
        const rectChanged = !newRect.Equals(groupInfo.current?.rect);
        //Object.assign(store, {width: newWidth, height: newHeight});
        graph.uiDebugKit?.FlashComp(ref.current, {text: `Rendering... @rc:${store.renderCount} @rect:${newRect}`});

        // if this is the first render, still call this (it's considered "moving/resizing" from rect-empty to the current rect)
        if (rectChanged) {
            graph.uiDebugKit?.FlashComp(ref.current, {text: `Rect changed. @rc:${store.renderCount} @rect:${newRect}`});
            graph.NotifyGroupUIMoveOrResize(groupInfo.current!, newRect);
        }
        
        if (store.renderCount > 0) {
            console.log(`Rerendering @count:${store.renderCount} @width:${groupInfo.current?.rect.width} @height:${groupInfo.current?.rect.height}`);
        } else {
            console.log("First render");
        }
        /*return ()=>{
            console.log("Test2");
        };*#/
    });*/
    return { ref_childHolder, ref_group };
}
export const ConnectorLinesPanel = React.memo((props) => {
    const { treePath, width, straightLines } = props;
    const linkSpawnPoint = new Vector2(0, 50); // should be 50% of height
    let childBoxInfos = [];
    return (React.createElement("svg", { className: "clickThroughChain", width: `${width}px`, height: "100%", style: {
            position: "absolute",
            //left: 0, right: 0,
            left: 0, width,
            //top: 0, bottom: 0,
            overflow: "visible", zIndex: -1
        } }, childBoxInfos.map((child, index) => {
        if (child.offset == null)
            return null;
        const childID = `${treePath}_${index}`;
        if (straightLines) {
            const start = linkSpawnPoint;
            const mid = child.offset.Minus(10, 0);
            const end = child.offset;
            return React.createElement("path", { key: `connectorLine_${childID}`, style: { stroke: child.color, strokeWidth: 3, fill: "none" }, d: `M${start.x},${start.y} L${mid.x},${mid.y} L${end.x},${end.y}` });
        }
        const start = linkSpawnPoint;
        let startControl = start.Plus(30, 0);
        const end = child.offset;
        let endControl = child.offset.Plus(-30, 0);
        const middleControl = start.Plus(end).Times(0.5); // average start-and-end to get middle-control
        startControl = startControl.Plus(middleControl).Times(0.5); // average with middle-control
        endControl = endControl.Plus(middleControl).Times(0.5); // average with middle-control
        const curvedLine = style => {
            return React.createElement("path", { style: E({ stroke: child.color, strokeWidth: 3, fill: "none" }, style), d: `M${start.x},${start.y} C${startControl.x},${startControl.y} ${endControl.x},${endControl.y} ${end.x},${end.y}` });
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
