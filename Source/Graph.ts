import {CE, Vector2, VRect, WaitXThenRun} from "js-vextensions";
import {configure, observable} from "mobx";
import {createContext} from "react";
import {TreeColumn} from "./Graph/TreeColumn.js";
import {Column} from "./UI/@Shared/Basics.js";
import {n, RequiredBy} from "./Utils/@Internal/Types.js";
import {GetPageRect} from "./Utils/General/General.js";
import {makeObservable_safe} from "./Utils/General/MobX.js";
import type {FlashComp} from "ui-debug-kit";
import {NodeGroup} from "./Graph/NodeGroup.js";
import {ConnectorLinesUI_Handle} from "./index.js";

// maybe temp
configure({enforceActions: "never"});

//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined as any as Graph; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext<Graph>(defaultGraph);

export class Graph {
	constructor(data: RequiredBy<Partial<Graph>, "columnWidth">) {
		makeObservable_safe(this, {
			columns: observable.shallow,
		});
		Object.assign(this, data);
	}
	containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
	columnWidth: number;
	uiDebugKit?: {FlashComp: typeof FlashComp};

	columns: TreeColumn[] = []; // @O
	groupsByPath = new Map<string, NodeGroup>();
	FindChildGroups(parentGroup: NodeGroup) {
		const prefix = parentGroup.path + "/";
		return [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix) && a.path.split("/").length == parentGroup.path.split("/").length + 1);
	}
	FindDescendantGroups(parentGroup: NodeGroup) {
		const prefix = parentGroup.path + "/";
		return [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix));
	}

	GetColumnsForGroup(group: NodeGroup) {
		if (group.chRect == null) return [];
		let firstIndex = Math.floor(group.chRect.x / this.columnWidth);
		let lastIndex = Math.floor(group.chRect.Right / this.columnWidth);

		// ensure all the necessary columns are created (start from 0, because we don't want gaps)
		for (let i = 0; i <= lastIndex; i++) {
			//if (this.columns[i] == null) {
			if (this.columns.length <= i) {
				this.columns[i] = new TreeColumn({
					index: i,
					rect: new VRect(i * this.columnWidth, 0, this.columnWidth, Number.MAX_SAFE_INTEGER),
				});
			}
		}
		return this.columns.slice(firstIndex, lastIndex + 1);
	}
	GetNextGroupsWithinColumnsFor(group: NodeGroup) {
		let result = new Set<NodeGroup>();
		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			const nextGroup = column.FindNextGroup(group);
			if (nextGroup) result.add(nextGroup);
		}
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

	NotifyGroupLeftColumnMount(el: HTMLElement, treePath: string) {
		const {group} = this.GetOrCreateGroup(treePath);
		group.leftColumnEl = el;
		group.UpdateLCRect();
		return group;
	}
	NotifyGroupChildHolderMount(el: HTMLElement, treePath: string, belowParent: boolean) {
		const {group, alreadyExisted} = this.GetOrCreateGroup(treePath);
		group.childHolderEl = el;
		group.childHolder_belowParent = belowParent;
		group.UpdateCHRect();
		return group;
	}
	NotifyGroupConnectorLinesUIMount(handle: ConnectorLinesUI_Handle, treePath: string) {
		const {group, alreadyExisted} = this.GetOrCreateGroup(treePath);
		group.connectorLinesComp = handle;
		return group;
	}

	NotifyGroupLeftColumnUnmount(group: NodeGroup) {
		group.leftColumnEl = null;
		if (group.childHolderEl != null || group.connectorLinesComp != null) {
			group.UpdateLCRect();
		} else {
			group.DetachAndDestroy();
		}
	}
	NotifyGroupChildHolderUnmount(group: NodeGroup) {
		group.childHolderEl = null;
		if (group.leftColumnEl != null || group.connectorLinesComp != null) {
			group.UpdateCHRect();
			/*group.UpdateColumns();
			group.RecalculateLeftColumnAlign();*/
		} else {
			group.DetachAndDestroy();
		}
	}
	NotifyGroupConnectorLinesUIUnmount(group: NodeGroup) {
		group.connectorLinesComp = null;
		if (group.leftColumnEl != null || group.childHolderEl != null) {
		} else {
			group.DetachAndDestroy();
		}
	}
}

/*export class GraphPassInfo {
	treePath: string;
}*/