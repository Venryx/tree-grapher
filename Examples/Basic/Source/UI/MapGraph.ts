import {useMemo} from "react";
import {Graph} from "tree-grapher";
import {GetURLOptions} from "../Root.js";
import {FlashComp, FlashOptions} from "ui-debug-kit";

export function useGraph(forLayoutHelper: boolean) {
	const graphInfo = useMemo(()=>{
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
		});
		// for debugging
		if (forLayoutHelper) {
			globalThis.layoutHelperGraph = graph;
		} else {
			globalThis.mainGraph = graph;
		}
		return graph;
	}, []);
	return graphInfo;
}