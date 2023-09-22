import {useMemo} from "react";
import {Graph, KeyframeInfo} from "tree-grapher";
import {GetURLOptions} from "../Root.js";
import {FlashComp, FlashOptions} from "ui-debug-kit";
import {GetLastKeyframe, GetNextKeyframe} from "./KeyframeApplier.js";
import {CE, GetPercentFromXToY} from "js-vextensions";
import {store} from "../Store.js";
import {GetVisibleNodePaths, GetVisibleNodePaths_JustFromKeyframes, Keyframe, keyframes} from "../@SharedByExamples/NodeData.js";

export const animation_transitionPeriod = .5;
export const GetPercentThroughTransition = (lastKeyframe: Keyframe|null|undefined, nextKeyframe: Keyframe|null|undefined)=>{
	const nextKeyframe_time = nextKeyframe?.time ?? 0;
	return GetPercentFromXToY(CE(lastKeyframe?.time ?? 0).KeepAtLeast(nextKeyframe_time - animation_transitionPeriod), nextKeyframe_time, store.targetTime);
};

export function useGraph(forLayoutHelper: boolean, layoutHelperGraph: Graph|null) {
	const graphInfo = useMemo(()=>{
		const getGroupStablePath = group=>group.leftColumn_userData?.["nodePath"];
		const mainGraph_getNextKeyframeInfo = (): KeyframeInfo=>{
			const lastKeyframe = GetLastKeyframe();
			const nextKeyframe = GetNextKeyframe();
			const finalKeyframe = CE(keyframes).Last();
			const nodesVisibleAtKeyframe = GetVisibleNodePaths_JustFromKeyframes((nextKeyframe ?? finalKeyframe).time);
			const layout = layoutHelperGraph!.GetLayout(undefined, group=>{
				//return mainGraph.groupsByPath.has(group.path);
				return nodesVisibleAtKeyframe.includes(group.leftColumn_userData?.["nodePath"] as string);
			})!;
			return {
				/*findHelperGroup: group=>{
					const helperGroups = [...layoutHelperGraph!.groupsByPath.values()];
					const targetNodePath = group.leftColumn_userData?.["nodePath"];
					return helperGroups.find(a=>a.leftColumn_userData?.["nodePath"] == targetNodePath);
				},*/
				layout,
				percentThroughTransition: GetPercentThroughTransition(lastKeyframe, nextKeyframe),
			};
		};

		const graph = new Graph({
			//columnWidth: 100,
			uiDebugKit: {FlashComp},
			layoutOpts: {
				//containerPadding: {left: 100, top: 100, right: 100, bottom: 100},
				nodeSpacing: ()=>GetURLOptions().nodeSpacing,
				styleSetter_layoutPending: style=>{
					//style.right = "100%"; // alternative (not quite as "reliable", since sometimes user code might depend on knowing the correct ui position right away)
					style.opacity = "0";
					style.pointerEvents = "none";
				},
				styleSetter_layoutDone: style=>{
					//style.right = "";
					style.opacity = "";
					style.pointerEvents = "";
				},
			},
			getScrollElFromContainerEl: containerEl=>containerEl.parentElement?.parentElement!,
			//getNextKeyframeInfo: forLayoutHelper ? undefined : mainGraph_getNextKeyframeInfo,
		});
		// for debugging
		if (forLayoutHelper) {
			globalThis.layoutHelperGraph = graph;
		} else {
			globalThis.mainGraph = graph;
		}
		
		if (layoutHelperGraph != null) {
			graph.StartAnimating(mainGraph_getNextKeyframeInfo, getGroupStablePath);
		}

		return graph;
	//}, [forLayoutHelper, layoutHelperGraph]);
	}, []); // API doesn't officially support changing these fields after creation, so don't even include them in the deps
	return graphInfo;
}