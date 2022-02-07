import {CE, VRect} from "js-vextensions";
import {configure, observable} from "mobx";
import {createContext} from "react";
import {TreeColumn} from "./Graph/TreeColumn.js";
import {Column} from "./UI/@Shared/Basics.js";
import {n, RequiredBy} from "./Utils/@Internal/Types.js";
import {GetPageRect} from "./Utils/General/General.js";
import {makeObservable_safe} from "./Utils/General/MobX.js";

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

	columns: TreeColumn[] = []; // @O
	groupsByPath = new Map<string, NodeGroupInfo>();

	GetColumnsForGroup(group: NodeGroupInfo) {
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

	NotifyGroupUIMount(element: HTMLElement, treePath: string) {
		if (!this.groupsByPath.has(treePath)) {
			const rect = GetPageRect(element);
			const group = new NodeGroupInfo({
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
		return group;
	}
	NotifyGroupUIUnmount(group: NodeGroupInfo) {
		this.groupsByPath.delete(group.parentPath);
		const columns = this.GetColumnsForGroup(group);
		for (const column of columns) {
			column.RemoveGroup(group);
		}
		return group;
	}
}

/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath: string) {
	const parts = treePath.split("/");
	const maxPartLength = CE(parts.map(a=>a.length)).Max();
	return parts.map(part=>part.padStart(maxPartLength, "0")).join("/");
}

export class NodeGroupInfo {
	constructor(data?: RequiredBy<Partial<NodeGroupInfo>, "graph" | "parentPath" | "element" | "rect">) {
		Object.assign(this, data);
	}
	graph: Graph;
	parentPath: string;
	get ParentPath_Sortable() { return TreePathAsSortableStr(this.parentPath); }
	element: HTMLElement;
	rect: VRect;

	RecalculateShift() {
		for (const column of this.graph.GetColumnsForGroup(this)) {
		}
	}
}

/*export class GraphPassInfo {
	treePath: string;
}*/