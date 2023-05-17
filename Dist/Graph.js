import { Assert, CE, Vector2, VRect } from "js-vextensions";
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
        this.groupsByPath = new Map();
        // new
        // ==========
        this.runLayout_scheduled = false;
        this.RunLayout_InAMoment = () => {
            if (this.runLayout_scheduled)
                return;
            this.runLayout_scheduled = true;
            //setTimeout(this.RunLayout);
            requestAnimationFrame(() => {
                this.RunLayout();
                this.runLayout_scheduled = false;
            });
        };
        this.RunLayout = (direction = "leftToRight") => {
            var _a, _b, _c, _d;
            //Assert(this.containerEl != null, "Container-element not found. Did you forget to set graph.containerEl, or wrap the ref-callback in a useCallback hook?");
            if (this.containerEl == null || this.groupsByPath.get("0") == null)
                return;
            const containerPadding = this.containerPadding;
            const layout = new FlexTreeLayout({
                children: group => {
                    const children = this.FindChildGroups(group).filter(a => a.leftColumnEl != null && a.lcSize != null); // ignore children that don't have their basic info loaded yet
                    const children_noSelfSideBoxes = children.filter(a => !a.leftColumn_connectorOpts.parentIsAbove);
                    const children_noSelfSideBoxes_addChildSideBoxes = CE(children_noSelfSideBoxes).SelectMany(child => {
                        const result = [child];
                        for (const grandChild of this.FindChildGroups(child)) {
                            if (grandChild.leftColumn_connectorOpts.parentIsAbove) {
                                result.push(grandChild);
                            }
                        }
                        return result;
                    });
                    //console.log(`For ${group.path}, found children:`, children_noSelfSideBoxes_addChildSideBoxes);
                    return children_noSelfSideBoxes_addChildSideBoxes;
                },
                nodeSize: node => {
                    const data = node.data;
                    Assert(data.lcSize != null, "layout.nodeSize encountered null lcSize!");
                    return direction == "topToBottom"
                        ? [data.lcSize.x, data.lcSize.y]
                        : [data.lcSize.y, data.lcSize.x];
                },
                spacing: (nodeA, nodeB) => {
                    var _a;
                    //return nodeA.path(nodeB).length;
                    return (_a = this.layoutOpts.nodeSpacing(nodeA, nodeB)) !== null && _a !== void 0 ? _a : 10;
                },
            });
            /*const groupsArray = [...graphInfo.groupsByPath.values()];
            const tree = layout.hierarchy(groupsArray);*/
            const tree = layout.hierarchy(this.groupsByPath.get("0"));
            layout.receiveTree(tree);
            const nodeRects_base = tree.nodes.map(node => {
                const newPos = direction == "topToBottom"
                    ? new VRect(node.x, node.y, node.xSize, node.ySize)
                    : new VRect(node.y, node.x, node.ySize, node.xSize);
                return newPos;
            });
            const minX = CE(nodeRects_base.map((rect, i) => rect.x)).Min();
            const maxX = CE(nodeRects_base.map((rect, i) => rect.Right)).Min();
            //const minY = CE(nodeRects_base.map((rect, i)=>rect.y)).Min();
            const minY = CE(nodeRects_base.map((rect, i) => {
                const group = tree.nodes[i].data;
                return rect.y - Number(group.innerUISize.y / 2);
            })).Min();
            const maxY = CE(nodeRects_base.map((rect, i) => rect.Bottom)).Max();
            const offset = new Vector2(containerPadding.left - minX, containerPadding.top - minY);
            for (const [i, node] of tree.nodes.entries()) {
                const group = node.data;
                if (group.leftColumnEl == null)
                    continue;
                const newPos = nodeRects_base[i].Position.Plus(offset);
                group.assignedPosition = newPos;
                const newRect = group.LCRect;
                if (!(newRect === null || newRect === void 0 ? void 0 : newRect.Equals(group.lcRect_atLastRender))) {
                    group.leftColumnEl.style.left = `${group.assignedPosition.x}px`;
                    //group.leftColumnEl.style.left = `calc(${group.assignedPosition.x}px - ${group.innerUIRect!.width / 2}px)`;
                    //group.leftColumnEl.style.top = `${group.assignedPosition.y}px`;
                    group.leftColumnEl.style.top = `calc(${group.assignedPosition.y}px - ${Number(group.innerUISize.y / 2)}px)`;
                    //console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);
                    // if this is our first render/layout, clear the style that had made our node invisible
                    if (group.leftColumnEl_layoutCount == 0)
                        (_b = (_a = this.layoutOpts).styleSetter_layoutDone) === null || _b === void 0 ? void 0 : _b.call(_a, group.leftColumnEl.style);
                    group.leftColumnEl_layoutCount++;
                    group.lcRect_atLastRender = newRect;
                    group.innerUIRect_atLastRender = group.InnerUIRect;
                }
            }
            (_c = this.spaceTakerComp) === null || _c === void 0 ? void 0 : _c.forceUpdate();
            (_d = this.connectorLinesComp) === null || _d === void 0 ? void 0 : _d.forceUpdate();
        };
        Object.assign(this, data);
    }
    FindParentGroup(childGroup) {
        return this.groupsByPath.get(childGroup.path_parts.slice(0, -1).join("/"));
    }
    FindChildGroups(parentGroup) {
        const prefix = `${parentGroup.path}/`;
        let result = [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix) && a.path_parts.length == parentGroup.path_parts.length + 1);
        result = CE(result).OrderBy(a => TreePathAsSortableStr(a.path));
        return result;
    }
    FindDescendantGroups(parentGroup) {
        const prefix = `${parentGroup.path}/`;
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
    NotifyGroupLeftColumnMount(el, treePath, connectorOpts, userData, alignWithParent) {
        const { group } = this.GetOrCreateGroup(treePath);
        group.leftColumnEl = el;
        group.leftColumn_connectorOpts = connectorOpts;
        group.leftColumn_userData = userData;
        group.leftColumn_alignWithParent = alignWithParent;
        this.RunLayout_InAMoment();
        return group;
    }
    NotifyGroupChildHolderMount(el, treePath, belowParent) {
        const { group, alreadyExisted } = this.GetOrCreateGroup(treePath);
        group.childHolderEl = el;
        group.childHolder_belowParent = belowParent;
        this.RunLayout_InAMoment();
        return group;
    }
    NotifySpaceTakerUIMount(handle) {
        this.spaceTakerComp = handle;
        //this.RunLayout_InAMoment(); // no need to run layout; space-taker comp is only needed for an ancestor scroll-container, not for any of our calcs
    }
    NotifyGroupConnectorLinesUIMount(handle) {
        this.connectorLinesComp = handle;
        this.RunLayout_InAMoment();
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
        //this.RunLayout();
        this.RunLayout_InAMoment();
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
        //this.RunLayout();
        this.RunLayout_InAMoment();
    }
    NotifySpaceTakerUIUnmount() {
        this.spaceTakerComp = null;
        //this.RunLayout_InAMoment(); // no need to run layout; space-taker comp is only needed for an ancestor scroll-container, not for any of our calcs
    }
    NotifyGroupConnectorLinesUIUnmount() {
        this.connectorLinesComp = null;
        //this.RunLayout();
        this.RunLayout_InAMoment();
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
