import {Assert, CE, TreeNode, Vector2, VRect} from "js-vextensions";
import {configure} from "mobx";
import {createContext} from "react";
import type {FlashComp} from "ui-debug-kit";
import {FlexTreeLayout, SpacingFunc} from "./Core/Core.js";
import {FlexNode} from "./Core/FlexNode.js";
import {NodeGroup, TreePathAsSortableStr} from "./Graph/NodeGroup.js";
import {ConnectorLinesUI_Handle, NodeConnectorOpts} from "./index.js";
import {SpaceTakerUI_Handle} from "./UI/SpaceTakerUI.js";
import {n, RequiredBy} from "./Utils/@Internal/Types.js";
import {CSSScalarToPixels} from "./Utils/General/General.js";

// maybe temp
configure({enforceActions: "never"});

//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined as any as Graph; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext<Graph>(defaultGraph);

export class Graph {
	constructor(data: RequiredBy<Partial<Graph>, "layoutOpts">) {
		Object.assign(this, data);
	}
	//containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
	containerEl?: HTMLElement;
	getScrollElFromContainerEl = (containerEl: HTMLElement)=>containerEl.parentElement;

	/*get ContainerPadding() {
		return {
			left: CSSScalarToPixels(this.containerEl?.style.paddingLeft ?? ""), right: CSSScalarToPixels(this.containerEl?.style.paddingRight ?? ""),
			top: CSSScalarToPixels(this.containerEl?.style.paddingTop ?? ""), bottom: CSSScalarToPixels(this.containerEl?.style.paddingBottom ?? ""),
		};
	}*/
	containerPadding: {left: number, right: number, top: number, bottom: number};
	/*contentScaling = 1;
	SetContentScaling(value: number) {
		const oldVal = this.contentScaling;
		this.contentScaling = value;
		if (value != oldVal) {
			setTimeout(()=>this.connectorLinesComp?.forceUpdate());
		}
	}*/

	spaceTakerComp: SpaceTakerUI_Handle|n;
	connectorLinesComp: ConnectorLinesUI_Handle|n;
	layoutOpts: {
		nodeSpacing: SpacingFunc<NodeGroup>;
		styleSetter_layoutPending?: (style: CSSStyleDeclaration)=>any,
		styleSetter_layoutDone?: (style: CSSStyleDeclaration)=>any,
	};
	uiDebugKit?: {FlashComp: typeof FlashComp};

	groupsByPath = new Map<string, NodeGroup>();
	groupsByParentPath = new Map<string, Map<string, NodeGroup>>(); // optimization; makes finding children for an entry much faster (which gets called frequently, during layout)
	FindParentGroup(childGroup: NodeGroup) {
		return this.groupsByPath.get(childGroup.path_parts.slice(0, -1).join("/"));
	}
	FindChildGroups(parentGroup: NodeGroup) {
		//const prefix = `${parentGroup.path}/`;
		//let result = [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix) && a.path_parts.length == parentGroup.path_parts.length + 1);
		const groupsUnderParent = this.groupsByParentPath.get(parentGroup.path);
		if (groupsUnderParent == null) return [];
		let result = [...groupsUnderParent!.values()];
		result = CE(result).OrderBy(a=>TreePathAsSortableStr(a.path));
		return result;
	}
	FindDescendantGroups(parentGroup: NodeGroup) {
		const prefix = `${parentGroup.path}/`;
		let result = [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix));
		result = CE(result).OrderBy(a=>TreePathAsSortableStr(a.path));
		return result;
	}

	GetOrCreateGroup(treePath: string) {
		const alreadyExisted = this.groupsByPath.has(treePath);
		if (!alreadyExisted) {
			const group = new NodeGroup({
				graph: this,
				path: treePath,
			});
			this.groupsByPath.set(treePath, group);

			// for groupsByParentPath optimization
			const parentPath = treePath.split("/").slice(0, -1).join("/");
			if (parentPath.length) {
				if (!this.groupsByParentPath.has(parentPath)) {
					this.groupsByParentPath.set(parentPath, new Map());
				}
				this.groupsByParentPath.get(parentPath)!.set(treePath, group);
			}
		}

		return {
			group: this.groupsByPath.get(treePath)!,
			alreadyExisted,
		};
	}

	NotifyGroupLeftColumnMount(el: HTMLElement, treePath: string, connectorOpts: NodeConnectorOpts, userData: Object, alignWithParent?: boolean) {
		const {group} = this.GetOrCreateGroup(treePath);
		group.leftColumnEl = el;
		group.leftColumn_connectorOpts = connectorOpts;
		group.leftColumn_userData = userData;
		group.leftColumn_alignWithParent = alignWithParent;

		this.RunLayout_InAMoment();
		return group;
	}
	NotifyGroupChildHolderMount(el: HTMLElement, treePath: string, belowParent: boolean) {
		const {group, alreadyExisted} = this.GetOrCreateGroup(treePath);
		group.childHolderEl = el;
		group.childHolder_belowParent = belowParent;

		this.RunLayout_InAMoment();
		return group;
	}
	NotifySpaceTakerUIMount(handle: SpaceTakerUI_Handle) {
		this.spaceTakerComp = handle;

		//this.RunLayout_InAMoment(); // no need to run layout; space-taker comp is only needed for an ancestor scroll-container, not for any of our calcs
	}
	NotifyGroupConnectorLinesUIMount(handle: ConnectorLinesUI_Handle) {
		this.connectorLinesComp = handle;

		this.RunLayout_InAMoment();
	}

	NotifyGroupLeftColumnUnmount(group: NodeGroup) {
		if (group.IsDestroyed()) return;
		group.leftColumnEl = null;
		/*if (group.childHolderEl != null) {
			new Wave(this, group, [
				new MyLCUnmounted({me: group})
			]).Down_StartWave();
		} else {*/
		group.DetachAndDestroy();

		//this.RunLayout();
		this.RunLayout_InAMoment();
	}
	NotifyGroupChildHolderUnmount(group: NodeGroup) {
		if (group.IsDestroyed()) return;
		group.childHolderEl = null;
		if (group.leftColumnEl != null) {
		} else {
			group.DetachAndDestroy();
		}

		//this.RunLayout();
		this.RunLayout_InAMoment();
	}
	NotifySpaceTakerUIUnmount() {
		this.spaceTakerComp = null;

		//this.RunLayout_InAMoment(); // no need to run layout; space-taker comp is only needed for an ancestor scroll-container, not for any of our calcs
	}
	NotifyGroupConnectorLinesUIUnmount() {
		this.connectorLinesComp = null;

		//this.RunLayout();
		this.RunLayout_InAMoment();
	}

	// new
	// ==========

	runLayout_scheduled = false;
	RunLayout_InAMoment = ()=>{
		if (this.runLayout_scheduled) return;
		this.runLayout_scheduled = true;
		//setTimeout(this.RunLayout);
		requestAnimationFrame(()=>{
			this.RunLayout();
			this.runLayout_scheduled = false;
		});
	};
	RunLayout = (direction = "leftToRight" as LayoutDirection)=>{
		//Assert(this.containerEl != null, "Container-element not found. Did you forget to set graph.containerEl, or wrap the ref-callback in a useCallback hook?");
		if (this.containerEl == null || this.groupsByPath.get("0") == null) return;

		const containerPadding = this.containerPadding;
		const layout = new FlexTreeLayout<NodeGroup>({
			children: group=>{
				const children = this.FindChildGroups(group).filter(a=>a.leftColumnEl != null && a.lcSize != null); // ignore children that don't have their basic info loaded yet
				const children_noSelfSideBoxes = children.filter(a=>!a.leftColumn_connectorOpts.parentIsAbove);
				const children_noSelfSideBoxes_addChildSideBoxes = CE(children_noSelfSideBoxes).SelectMany(child=>{
					const result = [child];
					for (const grandChild of this.FindChildGroups(child)) {
						if (grandChild.leftColumn_connectorOpts.parentIsAbove) {
							result.push(grandChild);
						}
					}
					return result;
				});

				//console.log(`For ${group.path}, found children:`, children_noSelfSideBoxes_addChildSideBoxes);
				return children_noSelfSideBoxes_addChildSideBoxes;
			},
			nodeSize: node=>{
				const data = node.data as NodeGroup;
				Assert(data.lcSize != null, "layout.nodeSize encountered null lcSize!");
				return direction == "topToBottom"
					? [data.lcSize.x, data.lcSize.y]
					: [data.lcSize.y, data.lcSize.x];
			},
			spacing: (nodeA, nodeB)=>{
				//return nodeA.path(nodeB).length;
				return this.layoutOpts.nodeSpacing(nodeA, nodeB) ?? 10;
			},
		});
		/*const groupsArray = [...graphInfo.groupsByPath.values()];
		const tree = layout.hierarchy(groupsArray);*/
		const tree = layout.hierarchy(this.groupsByPath.get("0")!);
		layout.receiveTree(tree);

		const treeNodes = tree.nodes; // This is a getter, and pretty expensive (at scale)! So cache its value here.
		const nodeRects_base: VRect[] = treeNodes.map(node=>{
			const newPos = direction == "topToBottom"
				? new VRect(node.x, node.y, node.xSize, node.ySize)
				: new VRect(node.y, node.x, node.ySize, node.xSize);
			return newPos;
		});
		const minX = CE(nodeRects_base.map((rect, i)=>rect.x)).Min();
		const maxX = CE(nodeRects_base.map((rect, i)=>rect.Right)).Min();
		//const minY = CE(nodeRects_base.map((rect, i)=>rect.y)).Min();
		const minY = CE(nodeRects_base.map((rect, i)=>{
			const group = treeNodes[i].data;
			return rect.y - Number(group.innerUISize!.y / 2);
		})).Min();
		const maxY = CE(nodeRects_base.map((rect, i)=>rect.Bottom)).Max();
		const offset = new Vector2(containerPadding.left - minX, containerPadding.top - minY);

		for (const [i, node] of treeNodes.entries()) {
			const group = node.data;
			if (group.leftColumnEl == null) continue;
			const newPos = nodeRects_base[i].Position.Plus(offset);
			group.assignedPosition = newPos;

			const newRect = group.LCRect;
			if (!newRect?.Equals(group.lcRect_atLastRender)) {
				group.leftColumnEl.style.left = `${group.assignedPosition.x}px`;
				//group.leftColumnEl.style.left = `calc(${group.assignedPosition.x}px - ${group.innerUIRect!.width / 2}px)`;
				//group.leftColumnEl.style.top = `${group.assignedPosition.y}px`;
				group.leftColumnEl.style.top = `calc(${group.assignedPosition.y}px - ${Number(group.innerUISize!.y / 2)}px)`;
				//console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);

				// if this is our first render/layout, clear the style that had made our node invisible
				if (group.leftColumnEl_layoutCount == 0) this.layoutOpts.styleSetter_layoutDone?.(group.leftColumnEl.style);

				group.leftColumnEl_layoutCount++;
				group.lcRect_atLastRender = newRect;
				group.innerUIRect_atLastRender = group.InnerUIRect;
			}
		}

		this.spaceTakerComp?.forceUpdate();
		this.connectorLinesComp?.forceUpdate();
	};
}
export type LayoutDirection = "topToBottom" | "leftToRight";

/*export class GraphPassInfo {
	treePath: string;
}*/