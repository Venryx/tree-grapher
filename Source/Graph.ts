import {CE, Vector2, VRect} from "js-vextensions";
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
	columnWidth: number;
	uiDebugKit?: {FlashComp: typeof FlashComp};

	columns: TreeColumn[] = []; // @O
	groupsByPath = new Map<string, NodeGroup>();
	FindChildGroups(parentGroup: NodeGroup) {
		const prefix = parentGroup.parentPath + "/";
		return [...this.groupsByPath.values()].filter(a=>a.parentPath.startsWith(prefix));
	}

	GetColumnsForGroup(group: NodeGroup) {
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

	NotifyGroupUIMount(element: HTMLElement, treePath: string) {
		if (!this.groupsByPath.has(treePath)) {
			const rect = GetPageRect(element);
			const group = new NodeGroup({
				graph: this,
				parentPath: treePath,
				element,
				rect,
			});
			this.groupsByPath.set(treePath, group);
		} else {
			console.warn(`Found existing NodeGroupInfo attached for path!:${treePath}`);
		}

		const group = this.groupsByPath.get(treePath)!;
		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			column.AddGroup(group);
		}
		for (const nextGroup of this.GetNextGroupsWithinColumnsFor(group)) {
			nextGroup.RecalculateShift();
		}
		return group;
	}
	NotifyGroupUIUnmount(group: NodeGroup) {
		this.groupsByPath.delete(group.parentPath);
		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			column.RemoveGroup(group);
		}
		for (const nextGroup of this.GetNextGroupsWithinColumnsFor(group)) {
			nextGroup.RecalculateShift();
		}
		return group;
	}
}

/*export class GraphPassInfo {
	treePath: string;
}*/