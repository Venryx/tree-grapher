import {Timer} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useEffect, useRef, useState} from "react";
import {useContext} from "react";
import {Button, Column, Row} from "react-vcomponents";
import {GraphContext} from "../../Graph.js";
import {n} from "../../Utils/@Internal/Types.js";
import {useForceUpdate} from "../../Utils/UI.js";

export const GraphColumnsVisualizer = observer((props: {levelsToScrollContainer?: number})=>{
	const {levelsToScrollContainer} = props;
	const graph = useContext(GraphContext);
	const forceUpdate = useForceUpdate();

	const ref = useRef<Row>(null);
	let [marginTopNeededToBeVisible, setMarginTopNeededToBeVisible] = useState(0);
	useEffect(()=>{
		let timer = new Timer(100, ()=>{
			if (levelsToScrollContainer != null && ref.current) {
				let nextUp: HTMLElement|n = ref.current.DOM_HTML;
				for (let i = 0; i < levelsToScrollContainer; i++) {
					nextUp = nextUp?.parentElement;
				}
				if (nextUp instanceof HTMLElement) {
					const deltaNeeded = nextUp.getBoundingClientRect().top - ref.current.DOM_HTML.getBoundingClientRect().top;
					const newVal = marginTopNeededToBeVisible + deltaNeeded;
					if (newVal != marginTopNeededToBeVisible) {
						setMarginTopNeededToBeVisible(newVal);
					}
				}
			}
			forceUpdate();
		}).Start();
		return ()=>timer.Stop();
	})

	return (
		<Row ref={ref} style={{
			position: "absolute", left: 0, right: 0, top: marginTopNeededToBeVisible, bottom: 0,
			display: "block", // needed for NodeUI's z-index to be able to work/show-above-us
			pointerEvents: "none",
		}}>
			{graph.columns.map((column, index)=>{
				return (
					<Column key={index} style={{display: "inline-flex", width: 100, height: "100%", border: "1px solid orange"}}>
						<Row>#{index} C:{column.groups_ordered.length}</Row>
						{/*<Row>
							<Button text="More" onClick={()=>{
								alert("TODO");
							}}/>
						</Row>*/}
					</Column>
				);
			})}
		</Row>
	);
});