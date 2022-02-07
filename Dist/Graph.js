import { CE, VRect } from "js-vextensions";
import { configure, observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { GetPageRect } from "./Utils/General/General.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
// maybe temp
configure({ enforceActions: "never" });
//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext(defaultGraph);
export class Graph {
    constructor(data) {
        this.columns = []; // @O
        this.groupsByPath = new Map();
        makeObservable_safe(this, {
            columns: observable.shallow,
        });
        Object.assign(this, data);
    }
    GetColumnsForGroup(group) {
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
    NotifyGroupUIMount(element, treePath) {
        if (!this.groupsByPath.has(treePath)) {
            const rect = GetPageRect(element);
            const group = new NodeGroupInfo({
                graph: this,
                parentPath: treePath,
                element,
                rect,
            });
            this.groupsByPath.set(treePath, group);
        }
        else {
            console.warn(`Found existing NodeGroupInfo attached for path!:${treePath}`);
        }
        const group = this.groupsByPath.get(treePath);
        const columns = this.GetColumnsForGroup(group);
        for (const column of columns) {
            column.AddGroup(group);
        }
        return group;
    }
    NotifyGroupUIUnmount(group) {
        this.groupsByPath.delete(group.parentPath);
        const columns = this.GetColumnsForGroup(group);
        for (const column of columns) {
            column.RemoveGroup(group);
        }
        return group;
    }
}
/** Converts, eg. "0.0.10.0" into "00.00.10.00", such that comparisons like XXX("0.0.10.0") > XXX("0.0.9.0") succeed. */
export function TreePathAsSortableStr(treePath) {
    const parts = treePath.split("/");
    const maxPartLength = CE(parts.map(a => a.length)).Max();
    return parts.map(part => part.padStart(maxPartLength, "0")).join("/");
}
export class NodeGroupInfo {
    constructor(data) {
        Object.assign(this, data);
    }
    get ParentPath_Sortable() { return TreePathAsSortableStr(this.parentPath); }
    RecalculateShift() {
        for (const column of this.graph.GetColumnsForGroup(this)) {
        }
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
