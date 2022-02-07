import { CE, VRect } from "js-vextensions";
import { observable } from "mobx";
import { createContext } from "react";
import { TreeColumn } from "./Graph/TreeColumn.js";
import { GetPageRect } from "./Utils/General/General.js";
import { makeObservable_safe } from "./Utils/General/MobX.js";
//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext(defaultGraph);
export class Graph {
    constructor(data) {
        this.columns = []; // @O
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
            if (this.columns[i] == null) {
                this.columns[i] = new TreeColumn({
                    rect: new VRect(i * this.columnWidth, 0, this.columnWidth, Number.MAX_SAFE_INTEGER),
                });
            }
        }
        return this.columns.slice(firstIndex, lastIndex + 1);
    }
    NotifyNodeGroupRendered(element, treePath) {
        const rect = GetPageRect(element);
        const group = new NodeGroupInfo({
            parentPath: treePath,
            element,
            rect,
        });
        const columns = this.GetColumnsForGroup(group);
        for (const column of columns) {
            column.AddGroup(group);
        }
        return group;
    }
    NotifyNodeGroupUnrendered(group) {
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
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
