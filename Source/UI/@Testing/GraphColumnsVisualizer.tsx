import {CE, E, Range, Timer, Vector2, WaitXThenRun} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useEffect, useRef, useState, useContext} from "react";
import {Button, Column, Row} from "react-vcomponents";
import {GraphContext} from "../../Graph.js";
import {n} from "../../Utils/@Internal/Types.js";
import {CSSScalarToPixels, GetMarginTopFromStyle} from "../../Utils/General/General.js";
import {useForceUpdate} from "../../Utils/UI.js";

// eslint-disable-next-line prefer-arrow-callback
export const GraphColumnsVisualizer = observer(function GraphColumnsVisualizer_(props: {levelsToScrollContainer?: number, zoomLevel?: number}) {
	const {levelsToScrollContainer, zoomLevel} = E({zoomLevel: 1}, props);
	const graph = useContext(GraphContext);
	const forceUpdate = useForceUpdate();

	//const [store] = useState({mousePos: new Vector2(-1, -1)});
	const [mousePos, setMousePos] = useState(new Vector2(-1, -1));
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(()=>{
		const mouseMoveListener = (e: MouseEvent)=>{
			if (ref.current == null) return;
			setMousePos(new Vector2(e.clientX - ref.current.getBoundingClientRect().x, e.clientY - ref.current.getBoundingClientRect().y));
		};
		document.addEventListener("mousemove", mouseMoveListener);
		return ()=>document.removeEventListener("mousemove", mouseMoveListener);
	});

	const [marginTopNeededToBeVisible, setMarginTopNeededToBeVisible] = useState(0);
	useEffect(()=>{
		const timer = new Timer(100, ()=>{
			if (ref.current == null) return;

			const rectTop_preMargin = ref.current.getBoundingClientRect().top;
			let newMarginTopToBeVisible_inPageViewport = 0 - rectTop_preMargin; // these rects are in viewport space, so "0" as the target-y just means top-of-viewport!
			newMarginTopToBeVisible_inPageViewport /= zoomLevel;

			let newMarginTopToBeVisible_inScrollContainerViewport = 0;
			if (levelsToScrollContainer != null) {
				let nextUp: HTMLElement|n = ref.current;
				for (let i = 0; i < levelsToScrollContainer; i++) {
					nextUp = nextUp?.parentElement;
				}
				if (nextUp instanceof HTMLElement) {
					newMarginTopToBeVisible_inScrollContainerViewport = nextUp.getBoundingClientRect().top - rectTop_preMargin;
				}
			}
			newMarginTopToBeVisible_inScrollContainerViewport /= zoomLevel;

			const newMarginTopToBeVisible_inBothViewports = Math.max(newMarginTopToBeVisible_inPageViewport, newMarginTopToBeVisible_inScrollContainerViewport);
			if (newMarginTopToBeVisible_inBothViewports != marginTopNeededToBeVisible) {
				setMarginTopNeededToBeVisible(newMarginTopToBeVisible_inBothViewports);
			}

			let {width: newWidth, height: newHeight} = ref.current.getBoundingClientRect();
			newWidth /= zoomLevel;
			newHeight /= zoomLevel;
			if (newWidth != width || newHeight != height) {
				console.log("GraphColumnsVisualizer size changed.", {newWidth, newHeight});
				setWidth(newWidth);
				setHeight(newHeight);
			} else {
				forceUpdate();
			}
		}).Start();
		return ()=>timer.Stop();
	});

	const columnOffsets = Range(0, CE(width).CeilingTo(100), 100, false);
	const rowOffsets = Range(0, CE(height).CeilingTo(100), 100, false);
	return (
		<div ref={ref} style={{position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden", pointerEvents: "none"}}>
			{mousePos.x != -1 &&
			<div style={{position: "absolute", right: 0 /*marginLeftNeededToBeVisible*/, top: marginTopNeededToBeVisible}}>
				{`${mousePos.x}, ${mousePos.y} (mouse)`}
			</div>}
			{/* vertical lines */}
			<Row style={{
				position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
			}}>
				{columnOffsets.map((columnOffset, index)=>{
					return (
						<Column key={index} style={{display: "inline-flex", width: 100, height: "100%", border: "solid hsla(40,100%,50%,.5)", borderWidth: "0 1px 0 0"}}>
							{/*<Row>#{index} C:{column.groups_ordered.length}</Row>*/}
							{/*<Row>
								<Button text="More" onClick={()=>{
									alert("TODO");
								}}/>
							</Row>*/}
						</Column>
					);
				})}
			</Row>
			{/* horizontal lines */}
			<Column style={{
				position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
			}}>
				{rowOffsets.map((rowOffset, index)=>{
					return (
						<Row key={index} style={{display: "inline-flex", width: "100%", height: 100, border: "solid hsla(40,100%,50%,.5)", borderWidth: "0 0 1px 0"}}>
							{columnOffsets.map((columnOffset, columnIndex)=>{
								return (
									<div key={columnIndex} style={{display: "inline-flex", width: 100, height: 100, opacity: .5, fontSize: 11}}>
										{`${columnOffset},${rowOffset}`}
									</div>
								);
							})}
						</Row>
					);
				})}
			</Column>
		</div>
	);
});