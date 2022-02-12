import { VRect } from "js-vextensions";
import { configure, observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
// maybe temp
configure({ enforceActions: "never" });
//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext(defaultGraph);
export class Graph {
    constructor(data) {
        this.containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
        this.columns = []; // @O
        this.groupsByPath = new Map();
        makeObservable_safe(this, {
            columns: observable.shallow,
        });
        Object.assign(this, data);
    }
    FindChildGroups(parentGroup) {
        const prefix = parentGroup.path + "/";
        return [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix) && a.path.split("/").length == parentGroup.path.split("/").length + 1);
    }
    FindDescendantGroups(parentGroup) {
        const prefix = parentGroup.path + "/";
        return [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix));
    }
    GetColumnsForGroup(group) {
        if (group.chRect == null)
            return [];
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
    GetOrCreateGroup(treePath) {
        const alreadyExisted = this.groupsByPath.has(treePath);
        if (!alreadyExisted) {
            const group = new NodeGroup({
                graph: this,
                path: treePath,
            });
            this.groupsByPath.set(treePath, group);
        }
        return {
            group: this.groupsByPath.get(treePath),
            alreadyExisted,
        };
    }
    NotifyGroupLeftColumnMount(el, treePath, connectorOpts, alignWithParent) {
        const { group } = this.GetOrCreateGroup(treePath);
        group.leftColumnEl = el;
        group.leftColumn_connectorOpts = connectorOpts;
        group.leftColumn_alignWithParent = alignWithParent;
        group.UpdateLCRect({ from: "NotifyGroupLeftColumnMount" });
        return group;
    }
    NotifyGroupChildHolderMount(el, treePath, belowParent) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.childHolderEl = el;
        group.childHolder_belowParent = belowParent;
        group.UpdateCHRect({ from: "NotifyGroupChildHolderMount" });
        return group;
    }
    NotifyGroupConnectorLinesUIMount(handle, treePath) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.connectorLinesComp = handle;
        return group;
    }
    NotifyGroupLeftColumnUnmount(group) {
        group.leftColumnEl = null;
        if (group.childHolderEl != null || group.connectorLinesComp != null) {
            group.UpdateLCRect({ from: "NotifyGroupLeftColumnUnmount" });
        }
        else {
            group.DetachAndDestroy();
        }
    }
    NotifyGroupChildHolderUnmount(group) {
        group.childHolderEl = null;
        if (group.leftColumnEl != null || group.connectorLinesComp != null) {
            group.UpdateCHRect({ from: "NotifyGroupChildHolderUnmount" });
            /*group.UpdateColumns();
            group.RecalculateLeftColumnAlign();*/
        }
        else {
            group.DetachAndDestroy();
        }
    }
    NotifyGroupConnectorLinesUIUnmount(group) {
        group.connectorLinesComp = null;
        if (group.leftColumnEl != null || group.childHolderEl != null) {
        }
        else {
            group.DetachAndDestroy();
        }
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
