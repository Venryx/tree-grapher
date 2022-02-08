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
		if (group.rect == null) return [];
		let firstIndex = Math.floor(group.rect.x / this.columnWidth);
		let lastIndex = Math.floor(group.rect.Right / this.columnWidth);

		// ensure all the necessary columns are created (start from 0, because we don't want gaps)
		for (let i = 0; i <= lastIndex; i++) {
			//if (this.columns[i] == null) {
			if (this.columns.length <= i) {
				this.columns[i] = new TreeColumn({
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
	NotifyGroupLeftColumnMountOrRender(leftColumnEl: HTMLElement, treePath: string) {
		const {group} = this.GetOrCreateGroup(treePath);
		group.leftColumnEl = leftColumnEl;
		return group;
	}
	NotifyGroupChildHolderMount(childHolderEl: HTMLElement, treePath: string) {
		const {group, alreadyExisted} = this.GetOrCreateGroup(treePath);
		group.childHolderEl = childHolderEl;
		group.rect = GetPageRect(childHolderEl);

		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			if (column.groups_ordered.includes(group)) continue;
			column.AddGroup(group);
		}
		for (const nextGroup of this.GetNextGroupsWithinColumnsFor(group)) {
			nextGroup.RecalculateChildHolderShift();
		}
		return group;
	}
	NotifyGroupUIUnmount(group: NodeGroup) {
		this.groupsByPath.delete(group.path);
		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			column.RemoveGroup(group);
		}
		
		// wait a tick for UI to actually be destroyed, then recalc stuff
		WaitXThenRun(0, ()=>{
			group.RecalculateLeftColumnAlign(); // back to 0
			for (const nextGroup of this.GetNextGroupsWithinColumnsFor(group)) {
				nextGroup.RecalculateChildHolderShift();
			}
		});

		return group;
	}
}

/*export class GraphPassInfo {
	treePath: string;
}*/