import {observer} from "mobx-react";
import React from "react";
import {useContext} from "react";
import {Button, Column, Row} from "react-vcomponents";
import {GraphContext} from "../../../../Dist/Graph.js";

export const GraphColumnsVisualizer = observer(()=>{
	const graph = useContext(GraphContext);
	return (
		<Row style={{
			position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
			display: "block", // needed for NodeUI's z-index to be able to work/show-above-us
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