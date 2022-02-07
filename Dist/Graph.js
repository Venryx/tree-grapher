import { VRect } from "js-vextensions";
import { configure, observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { GetPageRect } from "./Utils/General/General.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
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
    FindChildGroups(parentGroup) {
        const prefix = parentGroup.parentPath + "/";
        return [...this.groupsByPath.values()].filter(a => a.parentPath.startsWith(prefix));
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
    GetNextGroupsWithinColumnsFor(group) {
        let result = new Set();
        const columns = this.GetColumnsForGroup(group);
        for (const column of columns) {
            const nextGroup = column.FindNextGroup(group);
            if (nextGroup)
                result.add(nextGroup);
        }
        return result;
    }
    NotifyGroupUIMount(element, treePath) {
        if (!this.groupsByPath.has(treePath)) {
            const rect = GetPageRect(element);
            const group = new NodeGroup({
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
        for (const nextGroup of this.GetNextGroupsWithinColumnsFor(group)) {
            nextGroup.RecalculateShift();
        }
        return group;
    }
    NotifyGroupUIUnmount(group) {
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
