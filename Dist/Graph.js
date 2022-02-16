import { CE, Vector2 } from "js-vextensions";
import { configure } from "mobx";
import { createContext } from "react";
import { FlexTreeLayout } from "./Core/Core.js";
import { NodeGroup, TreePathAsSortableStr } from "./Graph/NodeGroup.js";
// maybe temp
configure({ enforceActions: "never" });
//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext(defaultGraph);
export class Graph {
    constructor(data) {
        this.containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
        this.groupsByPath = new Map();
        // new
        // ==========
        this.RunLayout = (direction = "leftToRight") => {
            var _a, _b;
            const layout = new FlexTreeLayout({
                children: (data) => {
                    const children = this.FindChildGroups(data);
                    const children_noSelfSideBoxes = children.filter(a => !a.leftColumn_connectorOpts.parentIsAbove);
                    const children_noSelfSideBoxes_addChildSideBoxes = CE(children_noSelfSideBoxes).SelectMany(child => {
                        let result = [child];
                        for (const grandChild of this.FindChildGroups(child)) {
                            if (grandChild.leftColumn_connectorOpts.parentIsAbove) {
                                result.push(grandChild);
                            }
                        }
                        return result;
                    });
                    console.log(`For ${data.path}, found children:`, children_noSelfSideBoxes_addChildSideBoxes);
                    return children_noSelfSideBoxes_addChildSideBoxes;
                },
                nodeSize: node => {
                    var _a, _b, _c, _d;
                    const data = node.data;
                    return direction == "topToBottom"
                        ? [(_a = data.lcSize) === null || _a === void 0 ? void 0 : _a.x, (_b = data.lcSize) === null || _b === void 0 ? void 0 : _b.y]
                        : [(_c = data.lcSize) === null || _c === void 0 ? void 0 : _c.y, (_d = data.lcSize) === null || _d === void 0 ? void 0 : _d.x];
                },
                spacing: (nodeA, nodeB) => {
                    //return nodeA.path(nodeB).length;
                    return 10;
                },
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
            const minX = CE(nodePositions_base.map((pos, i) => pos.x)).Min();
            const minY = CE(nodePositions_base.map((pos, i) => {
                const group = tree.nodes[i].data;
                return pos.y - Number(group.innerUISize.y / 2);
            })).Min();
            const offset = new Vector2(100 - minX, 100 - minY);
            for (const [i, node] of tree.nodes.entries()) {
                const group = node.data;
                if (group.leftColumnEl == null)
                    continue;
                const newPos = nodePositions_base[i].Plus(offset);
                group.assignedPosition = newPos;
                const newRect = group.LCRect;
                if (!(newRect === null || newRect === void 0 ? void 0 : newRect.Equals(group.lcRect_atLastRender))) {
                    group.leftColumnEl.style.left = `${group.assignedPosition.x}px`;
                    //group.leftColumnEl.style.left = `calc(${group.assignedPosition.x}px - ${group.innerUIRect!.width / 2}px)`;
                    //group.leftColumnEl.style.top = `${group.assignedPosition.y}px`;
                    group.leftColumnEl.style.top = `calc(${group.assignedPosition.y}px - ${Number(group.innerUISize.y / 2)}px)`;
                    console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);
                    group.lcRect_atLastRender = newRect;
                    group.innerUIRect_atLastRender = group.InnerUIRect;
                }
            }
            (_b = this.connectorLinesComp) === null || _b === void 0 ? void 0 : _b.forceUpdate();
        };
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
        setTimeout(this.RunLayout);
        return group;
    }
    NotifyGroupChildHolderMount(el, treePath, belowParent) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.childHolderEl = el;
        group.childHolder_belowParent = belowParent;
        setTimeout(this.RunLayout);
        return group;
    }
    NotifyGroupConnectorLinesUIMount(handle) {
        this.connectorLinesComp = handle;
        setTimeout(this.RunLayout);
    }
    NotifyGroupLeftColumnUnmount(group) {
        if (group.IsDestroyed())
            return;
        group.leftColumnEl = null;
        /*if (group.childHolderEl != null) {
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
        if (group.leftColumnEl != null) {
        }
        else {
            group.DetachAndDestroy();
        }
        this.RunLayout();
    }
    NotifyGroupConnectorLinesUIUnmount() {
        this.connectorLinesComp = null;
        this.RunLayout();
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
