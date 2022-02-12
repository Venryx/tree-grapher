import { CE, VRect } from "js-vextensions";
import { configure, observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
import { NodeGroup, TreePathAsSortableStr } from "./Graph/NodeGroup.js";
import { Wave, MyCHMounted, MyCHUnmounted, MyLCMounted } from "./index.js";
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
    FindParentGroup(childGroup) {
        return this.groupsByPath.get(childGroup.path_parts.slice(0, -1).join("/"));
    }
    FindChildGroups(parentGroup) {
        const prefix = parentGroup.path + "/";
        let result = [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix) && a.path_parts.length == parentGroup.path_parts.length + 1);
        result = CE(result).OrderBy(a => TreePathAsSortableStr(a.path));
        return result;
    }
    FindDescendantGroups(parentGroup) {
        const prefix = parentGroup.path + "/";
        let result = [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix));
        result = CE(result).OrderBy(a => TreePathAsSortableStr(a.path));
        return result;
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
            //const nextGroup = column.FindNextGroup(group);
            const nextGroup = column.FindNextGroup_HighestCHRect(group);
            if (nextGroup)
                result.add(nextGroup);
            /*for (const nextGroup of column.FindNextGroups(group)) {
                result.add(nextGroup);
            }*/
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
        new Wave(this, group, [
            new MyLCMounted({ me: group })
        ]).Down_StartWave();
        return group;
    }
    NotifyGroupChildHolderMount(el, treePath, belowParent) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.childHolderEl = el;
        group.childHolder_belowParent = belowParent;
        new Wave(this, group, [
            new MyCHMounted({ me: group })
        ]).Down_StartWave();
        return group;
    }
    NotifyGroupConnectorLinesUIMount(handle, treePath) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.connectorLinesComp = handle;
        return group;
    }
    NotifyGroupLeftColumnUnmount(group) {
        if (group.IsDestroyed())
            return;
        group.leftColumnEl = null;
        /*if (group.childHolderEl != null || group.connectorLinesComp != null) {
            new Wave(this, group, [
                new MyLCUnmounted({me: group})
            ]).Down_StartWave();
        } else {*/
        group.DetachAndDestroy();
    }
    NotifyGroupChildHolderUnmount(group) {
        if (group.IsDestroyed())
            return;
        group.childHolderEl = null;
        if (group.leftColumnEl != null || group.connectorLinesComp != null) {
            new Wave(this, group, [
                new MyCHUnmounted({ me: group })
            ]).Down_StartWave();
        }
        else {
            group.DetachAndDestroy();
        }
    }
    NotifyGroupConnectorLinesUIUnmount(group) {
        if (group.IsDestroyed())
            return;
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
