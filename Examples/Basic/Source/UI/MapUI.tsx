import {CE, E} from "js-vextensions";
import {observer} from "mobx-react";
import React, {useCallback, useMemo, useState} from "react";
import {ConnectorLinesUI, Graph, GraphColumnsVisualizer, GraphContext, SpaceTakerUI} from "tree-grapher";
import {store} from "../Store.js";
import {GetDOM} from "react-vextensions";
import {MapContext, MapInfo} from "../Root.js";
import {NodeUI} from "./NodeUI.js";
import {KeyframeApplier} from "./KeyframeApplier.js";
import {GetAllNodesInTree_ByNodePath, nodeTree_main} from "../@SharedByExamples/NodeData.js";

/*export let mapInfo_main: MapInfo;
export let mapInfo_layoutHelper: MapInfo;*/

export const MapUI = observer(function MapUI(props: {mainGraph: Graph, mainGraphIsLayoutHelper: boolean, layoutHelperGraph?: Graph}) {
	const {mainGraph, mainGraphIsLayoutHelper, layoutHelperGraph} = props;

	const [containerElResolved, setContainerElResolved] = useState(false);
	const mapUI_ref = useCallback(c=>{
		//this.mapUIEl = c;
		mainGraph.containerEl = c;
		if (mainGraph.containerEl != null) setContainerElResolved(true);
	}, [mainGraph]);

	const nodeTree = nodeTree_main;
	const mapInfo = useMemo(()=>{
		const result = new MapInfo();
		result.allowKeyframeOverride = !mainGraphIsLayoutHelper;
		// for demo
		for (const [path, node] of GetAllNodesInTree_ByNodePath(nodeTree)) {
			result.GetNodeState(path).expanded = node.expanded ?? false;
			result.GetNodeState(path).focused = node.focused ?? false;
			if (mainGraphIsLayoutHelper) {
				result.GetNodeState(path).expanded = true;
				result.GetNodeState(path).focused = false;
			}
		}
		return result;
	}, [nodeTree]);

	/*if (mainGraphIsLayoutHelper) mapInfo_layoutHelper = mapInfo;
	else mapInfo_main = mapInfo;*/

	return (
		<div style={{position: "relative", height: `calc(100% - ${mainGraphIsLayoutHelper ? 0 : 30}px)`, overflow: "scroll"}}>
			<div style={E(
				{position: "relative", minWidth: "fit-content", minHeight: "fit-content"} as const,
			)}>
				<SpaceTakerUI graph={mainGraph} scaling={store.zoomLevel}/>
				<div ref={mapUI_ref} style={E(
					//{position: "relative", width: "fit-content", height: "fit-content"} as const,
					{
						position: "absolute", left: 0, top: 0,
						width: CE(1 / store.zoomLevel).ToPercentStr(), height: CE(1 / store.zoomLevel).ToPercentStr(),
						///* display: "flex", */ whiteSpace: "nowrap",
						alignItems: "center",
					} as const,
					//mapState.zoomLevel != 1 && {zoom: mapState.zoomLevel.ToPercentStr()},
					store.zoomLevel != 1 && {
						transform: `scale(${CE(store.zoomLevel).ToPercentStr()})`,
						transformOrigin: "0% 0%",
					} as const,
				)}>
					{containerElResolved &&
					<MapContext.Provider value={mapInfo}>
						<GraphContext.Provider value={mainGraph}>
							<GraphColumnsVisualizer levelsToScrollContainer={3} zoomLevel={store.zoomLevel}/>
							<ConnectorLinesUI/>
							<NodeUI node={nodeTree} nodePath={nodeTree.id} treePath="0" forLayoutHelper={mainGraphIsLayoutHelper}/>
							<KeyframeApplier mainGraph={mainGraph} layoutHelperGraph={layoutHelperGraph}/>
						</GraphContext.Provider>
					</MapContext.Provider>}
				</div>
			</div>
		</div>
	);
});