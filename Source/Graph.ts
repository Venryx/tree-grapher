import {CE, Vector2} from "js-vextensions";
import {configure} from "mobx";
import {createContext} from "react";
import type {FlashComp} from "ui-debug-kit";
import {FlexTreeLayout} from "./Core/Core.js";
import {FlexNode} from "./Core/FlexNode.js";
import {NodeGroup, TreePathAsSortableStr} from "./Graph/NodeGroup.js";
import {ConnectorLinesUI_Handle, NodeConnectorOpts} from "./index.js";
import {n, RequiredBy} from "./Utils/@Internal/Types.js";

// maybe temp
configure({enforceActions: "never"});

//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined as any as Graph; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext<Graph>(defaultGraph);

export class Graph {
	constructor(data: RequiredBy<Partial<Graph>, "columnWidth">) {
		Object.assign(this, data);
	}
	containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
	connectorLinesComp: ConnectorLinesUI_Handle|n;
	columnWidth: number;
	uiDebugKit?: {FlashComp: typeof FlashComp};

	groupsByPath = new Map<string, NodeGroup>();
	FindParentGroup(childGroup: NodeGroup) {
		return this.groupsByPath.get(childGroup.path_parts.slice(0, -1).join("/"));
	}
	FindChildGroups(parentGroup: NodeGroup) {
		const prefix = parentGroup.path + "/";
		let result = [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix) && a.path_parts.length == parentGroup.path_parts.length + 1);
		result = CE(result).OrderBy(a=>TreePathAsSortableStr(a.path));
		return result;
	}
	FindDescendantGroups(parentGroup: NodeGroup) {
		const prefix = parentGroup.path + "/";
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
		}
		return {
			group: this.groupsByPath.get(treePath)!,
			alreadyExisted,
		};
	}

	NotifyGroupLeftColumnMount(el: HTMLElement, treePath: string, connectorOpts: NodeConnectorOpts, alignWithParent?: boolean) {
		const {group} = this.GetOrCreateGroup(treePath);
		group.leftColumnEl = el;
		group.leftColumn_connectorOpts = connectorOpts;
		group.leftColumn_alignWithParent = alignWithParent;

		setTimeout(this.RunLayout);
		return group;
	}
	NotifyGroupChildHolderMount(el: HTMLElement, treePath: string, belowParent: boolean) {
		const {group, alreadyExisted} = this.GetOrCreateGroup(treePath);
		group.childHolderEl = el;
		group.childHolder_belowParent = belowParent;

		setTimeout(this.RunLayout);
		return group;
	}
	NotifyGroupConnectorLinesUIMount(handle: ConnectorLinesUI_Handle) {
		this.connectorLinesComp = handle;

		setTimeout(this.RunLayout);
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

		this.RunLayout();
	}
	NotifyGroupChildHolderUnmount(group: NodeGroup) {
		if (group.IsDestroyed()) return;
		group.childHolderEl = null;
		if (group.leftColumnEl != null) {
		} else {
			group.DetachAndDestroy();
		}

		this.RunLayout();
	}
	NotifyGroupConnectorLinesUIUnmount() {
		this.connectorLinesComp = null;

		this.RunLayout();
	}

	// new
	// ==========

	RunLayout = (direction = "leftToRight" as LayoutDirection)=>{
		const layout = new FlexTreeLayout({
			children: (data: NodeGroup)=>{
				const children = this.FindChildGroups(data);
				const children_noSelfSideBoxes = children.filter(a=>!a.leftColumn_connectorOpts.parentIsAbove);
				const children_noSelfSideBoxes_addChildSideBoxes = CE(children_noSelfSideBoxes).SelectMany(child=>{
					let result = [child];
					for (const grandChild of this.FindChildGroups(child)) {
						if (grandChild.leftColumn_connectorOpts.parentIsAbove) {
							result.push(grandChild);
						}
					}
					return result;
				});

				console.log(`For ${data.path}, found children:`, children_noSelfSideBoxes_addChildSideBoxes);
				return children_noSelfSideBoxes_addChildSideBoxes;
			},
			nodeSize: node=>{
				const data = node.data as NodeGroup;
				return direction == "topToBottom"
					? [data.lcSize?.x, data.lcSize?.y]
					: [data.lcSize?.y, data.lcSize?.x];
			},
			spacing: (nodeA, nodeB)=>{
				//return nodeA.path(nodeB).length;
				return 10;
			},
		});
		/*const groupsArray = [...graphInfo.groupsByPath.values()];
		const tree = layout.hierarchy(groupsArray);*/
		const tree = layout.hierarchy(this.groupsByPath.get("0")! ?? {} as NodeGroup);
		layout.receiveTree(tree);

		const nodePositions_base: Vector2[] = tree.nodes.map(node=>{
			const newPos = direction == "topToBottom"
				? new Vector2(node.x, node.y)
				: new Vector2(node.y, node.x);
			return newPos;
		});
		const minX = CE(nodePositions_base.map((pos, i)=>pos.x)).Min();
		const minY = CE(nodePositions_base.map((pos, i)=>{
			const group = tree.nodes[i].data;
			return pos.y - Number(group.innerUISize!.y / 2);
		})).Min();
		const offset = new Vector2(100 - minX, 100 - minY);
		
		for (const [i, node] of tree.nodes.entries()) {
			const group = node.data;
			if (group.leftColumnEl == null) continue;
			const newPos = nodePositions_base[i].Plus(offset);
			group.assignedPosition = newPos;

			const newRect = group.LCRect;
			if (!newRect?.Equals(group.lcRect_atLastRender)) {
				group.leftColumnEl.style.left = `${group.assignedPosition.x}px`;
				//group.leftColumnEl.style.left = `calc(${group.assignedPosition.x}px - ${group.innerUIRect!.width / 2}px)`;
				//group.leftColumnEl.style.top = `${group.assignedPosition.y}px`;
				group.leftColumnEl.style.top = `calc(${group.assignedPosition.y}px - ${Number(group.innerUISize!.y / 2)}px)`;
				console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);

				group.lcRect_atLastRender = newRect;
				group.innerUIRect_atLastRender = group.InnerUIRect;
			}
		}

		this.connectorLinesComp?.forceUpdate();
	};
}
export type LayoutDirection = "topToBottom" | "leftToRight";

/*export class GraphPassInfo {
	treePath: string;
}*/