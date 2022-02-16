import { CE, Vector2, VRect } from "js-vextensions";
import { configure, observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
import { NodeGroup, TreePathAsSortableStr } from "./Graph/NodeGroup.js";
import { Wave, MyCHMounted, MyCHUnmounted, MyLCMounted } from "./index.js";
import { FlexTreeLayout } from "./Core/Core.js";
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
        // new
        // ==========
        this.RunLayout = (direction = "leftToRight") => {
            var _a;
            const layout = new FlexTreeLayout({
                children: (data) => {
                    const result = this.FindChildGroups(data);
                    console.log(`For ${data.path}, found children:`, result);
                    return result;
                },
                nodeSize: node => {
                    var _a, _b, _c, _d;
                    const data = node.data;
                    return direction == "topToBottom"
                        ? [(_a = data.innerUIRect) === null || _a === void 0 ? void 0 : _a.width, (_b = data.innerUIRect) === null || _b === void 0 ? void 0 : _b.height]
                        : [(_c = data.innerUIRect) === null || _c === void 0 ? void 0 : _c.height, (_d = data.innerUIRect) === null || _d === void 0 ? void 0 : _d.width];
                },
                spacing: (nodeA, nodeB) => nodeA.path(nodeB).length,
            });
            /*const groupsArray = [...graphInfo.groupsByPath.values()];
            const tree = layout.hierarchy(groupsArray);*/
            const tree = layout.hierarchy((_a = this.groupsByPath.get("0")) !== null && _a !== void 0 ? _a : {});
            layout.receiveTree(tree);
            const nodePositions_base = tree.nodes.map(node => {
                const newPos = direction == "topToBottom"
                    ? new Vector2(node.x, node.y)
                    : new Vector2(node.y, node.x);
                return newPos;
            });
            const minX = CE(nodePositions_base.map(a => a.x)).Min();
            const minY = CE(nodePositions_base.map(a => a.y)).Min();
            const offset = new Vector2(100 - minX, 100 - minY);
            for (const [i, node] of tree.nodes.entries()) {
                const group = node.data;
                const newPos = nodePositions_base[i].Plus(offset);
                //if (newPos.x != group.assignedPosition.x || newPos.y != group.assignedPosition.y) {
                group.assignedPosition = newPos;
                if (group.leftColumnEl) {
                    group.leftColumnEl.style.left = `${group.assignedPosition.x}px`;
                    //group.leftColumnEl.style.left = `calc(${group.assignedPosition.x}px - ${group.innerUIRect!.width / 2}px)`;
                    //group.leftColumnEl.style.top = `${group.assignedPosition.y}px`;
                    group.leftColumnEl.style.top = `calc(${group.assignedPosition.y}px - ${Number(group.innerUIRect.height / 2)}px)`;
                }
                console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);
            }
        };
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
        setTimeout(this.RunLayout);
        return group;
    }
    NotifyGroupChildHolderMount(el, treePath, belowParent) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.childHolderEl = el;
        group.childHolder_belowParent = belowParent;
        new Wave(this, group, [
            new MyCHMounted({ me: group })
        ]).Down_StartWave();
        setTimeout(this.RunLayout);
        return group;
    }
    NotifyGroupConnectorLinesUIMount(handle, treePath) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.connectorLinesComp = handle;
        setTimeout(this.RunLayout);
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
        this.RunLayout();
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
        this.RunLayout();
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
        this.RunLayout();
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
