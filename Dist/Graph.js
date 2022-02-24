import { Assert, CE, Vector2 } from "js-vextensions";
import { configure } from "mobx";
import { createContext } from "react";
import { FlexTreeLayout } from "./Core/Core.js";
import { NodeGroup, TreePathAsSortableStr } from "./Graph/NodeGroup.js";
import { CSSScalarToPixels } from "./Utils/General/General.js";
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
            var _a, _b, _c;
            //Assert(this.containerEl != null, "Container-element not found. Did you forget to set graph.containerEl, or wrap the ref-callback in a useCallback hook?");
            if (this.containerEl == null || this.groupsByPath.get("0") == null)
                return;
            const containerPadding = this.ContainerPadding;
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
            const offset = new Vector2(containerPadding.left - minX, containerPadding.top - minY);
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
                    //console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);
                    // if this is our first render/layout, clear the style that had made our node invisible
                    if (group.leftColumnEl_layoutCount == 0)
                        (_b = (_a = this.layoutOpts).styleSetter_layoutDone) === null || _b === void 0 ? void 0 : _b.call(_a, group.leftColumnEl.style);
                    group.leftColumnEl_layoutCount++;
                    group.lcRect_atLastRender = newRect;
                    group.innerUIRect_atLastRender = group.InnerUIRect;
                }
            }
            (_c = this.connectorLinesComp) === null || _c === void 0 ? void 0 : _c.forceUpdate();
        };
        Object.assign(this, data);
    }
    get ContainerPadding() {
        return {
            left: CSSScalarToPixels(this.containerEl.style.paddingLeft), right: CSSScalarToPixels(this.containerEl.style.paddingRight),
            top: CSSScalarToPixels(this.containerEl.style.paddingTop), bottom: CSSScalarToPixels(this.containerEl.style.paddingBottom),
        };
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
    NotifyGroupLeftColumnMount(el, treePath, connectorOpts, alignWithParent) {
        const { group } = this.GetOrCreateGroup(treePath);
        group.leftColumnEl = el;
        group.leftColumn_connectorOpts = connectorOpts;
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
    NotifyGroupConnectorLinesUIUnmount() {
        this.connectorLinesComp = null;
        //this.RunLayout();
        this.RunLayout_InAMoment();
    }
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
