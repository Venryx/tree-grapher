import { Assert, CE, Lerp, Vector2, VRect } from "js-vextensions";
import { configure, autorun } from "mobx";
import { createContext } from "react";
import { FlexTreeLayout } from "./Core/Core.js";
import { NodeGroup } from "./Graph/NodeGroup.js";
// maybe temp
configure({ enforceActions: "never" });
//const defaultGraph = new Graph({columnWidth: 100});
const defaultGraph = undefined; // we want an error if someone forgets to add the GraphContext.Provider wrapper
export const GraphContext = createContext(defaultGraph);
//export type AnimationData = {visibleNodeGroupPaths: string[], percentThroughTransition: number};
export function InterpolateVector(vecA, vecB, percent) {
    return new Vector2(Lerp(vecA.x, vecB.x, percent), Lerp(vecA.y, vecB.y, percent));
}
export class Graph {
    constructor(data) {
        Object.assign(this, data);
    }
    //containerEl = document.body; // start out the "container" as the body, just so there aren't null errors prior to container-ref resolving
    containerEl;
    getScrollElFromContainerEl = (containerEl) => containerEl.parentElement;
    // animation system
    /** This should be a mobx-compatible getter function, which returns information required for smoothly animating changes to node positions. (will try to add animation of size-changes later) */
    getNextKeyframeInfo;
    getGroupStablePath;
    animation_autorunDisposer;
    // live variables (ie. driven by animation-autorun, which then trigger new layouts)
    nextKeyframeInfo;
    StartAnimating(getNextKeyframeInfo, getGroupStablePath) {
        if (this.animation_autorunDisposer != null) {
            throw new Error("Animation autorun already exists; must end the earlier one first.");
        }
        this.getNextKeyframeInfo = getNextKeyframeInfo;
        this.getGroupStablePath = getGroupStablePath;
        this.animation_autorunDisposer = autorun(() => {
            this.nextKeyframeInfo = this.getNextKeyframeInfo();
            if (this.nextKeyframeInfo) {
                this.RunLayout_InAMoment();
            }
        });
    }
    StopAnimating() {
        if (this.animation_autorunDisposer)
            this.animation_autorunDisposer();
    }
    anchorNode_targetInfo;
    anchorNode_targetFinderFunc = nodeLayouts => {
        return this.anchorNode_targetInfo && nodeLayouts.find(a => a.treeNode.data.path == this.anchorNode_targetInfo.treePath);
    };
    /** Makes-so when the next layout is applied, the scroll-view is simultaneously scrolled so that the anchor-node remains at the same position as it had been prior to the layout application. */
    SetAnchorNode(treePath, extras = {}) {
        this.anchorNode_targetInfo = { treePath, extras };
        //this.RunLayout_InAMoment();
    }
    /*get ContainerPadding() {
        return {
            left: CSSScalarToPixels(this.containerEl?.style.paddingLeft ?? ""), right: CSSScalarToPixels(this.containerEl?.style.paddingRight ?? ""),
            top: CSSScalarToPixels(this.containerEl?.style.paddingTop ?? ""), bottom: CSSScalarToPixels(this.containerEl?.style.paddingBottom ?? ""),
        };
    }*/
    containerPadding;
    /*contentScaling = 1;
    SetContentScaling(value: number) {
        const oldVal = this.contentScaling;
        this.contentScaling = value;
        if (value != oldVal) {
            setTimeout(()=>this.connectorLinesComp?.forceUpdate());
        }
    }*/
    spaceTakerComp;
    connectorLinesComp;
    layoutOpts;
    uiDebugKit;
    groupsByPath = new Map();
    groupsByParentPath = new Map(); // optimization; makes finding children for an entry much faster (which gets called frequently, during layout)
    FindParentGroup(childGroup) {
        return this.groupsByPath.get(childGroup.path_parts.slice(0, -1).join("/"));
    }
    FindChildGroups(parentGroup) {
        //const prefix = `${parentGroup.path}/`;
        //let result = [...this.groupsByPath.values()].filter(a=>a.path.startsWith(prefix) && a.path_parts.length == parentGroup.path_parts.length + 1);
        const groupsUnderParent = this.groupsByParentPath.get(parentGroup.path);
        if (groupsUnderParent == null)
            return [];
        let result = [...groupsUnderParent.values()];
        result = CE(result).OrderBy(a => a.path_sortable);
        return result;
    }
    FindDescendantGroups(parentGroup) {
        const prefix = `${parentGroup.path}/`;
        let result = [...this.groupsByPath.values()].filter(a => a.path.startsWith(prefix));
        result = CE(result).OrderBy(a => a.path_sortable);
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
            // for groupsByParentPath optimization
            const parentPath = treePath.split("/").slice(0, -1).join("/");
            if (parentPath.length) {
                if (!this.groupsByParentPath.has(parentPath)) {
                    this.groupsByParentPath.set(parentPath, new Map());
                }
                this.groupsByParentPath.get(parentPath).set(treePath, group);
            }
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
    // new
    // ==========
    runLayout_scheduled = false;
    RunLayout_InAMoment = () => {
        if (this.runLayout_scheduled)
            return;
        this.runLayout_scheduled = true;
        //setTimeout(this.RunLayout);
        requestAnimationFrame(() => {
            this.RunLayout();
            this.runLayout_scheduled = false;
        });
    };
    RunLayout = (direction = "leftToRight") => {
        const ownLayout = this.GetLayout(direction);
        if (ownLayout == null)
            return;
        this.ApplyLayout(ownLayout, direction);
    };
    GetLayout = (direction = "leftToRight", nodeGroupFilter = (group) => true) => {
        //Assert(this.containerEl != null, "Container-element not found. Did you forget to set graph.containerEl, or wrap the ref-callback in a useCallback hook?");
        if (this.containerEl == null || this.groupsByPath.get("0") == null)
            return null;
        const layout = new FlexTreeLayout({
            children: group => {
                const children = this.FindChildGroups(group).filter(nodeGroupFilter).filter(a => a.leftColumnEl != null && a.lcSize != null); // ignore children that don't have their basic info loaded yet
                const children_noSelfSideBoxes = children.filter(a => !a.leftColumn_connectorOpts.parentIsAbove);
                const children_noSelfSideBoxes_addChildSideBoxes = CE(children_noSelfSideBoxes).SelectMany(child => {
                    const result = [child];
                    for (const grandChild of this.FindChildGroups(child).filter(nodeGroupFilter)) {
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
                //return nodeA.path(nodeB).length;
                return this.layoutOpts.nodeSpacing(nodeA, nodeB) ?? 10;
            },
        });
        /*const groupsArray = [...graphInfo.groupsByPath.values()];
        const tree = layout.hierarchy(groupsArray);*/
        const tree = layout.hierarchy(this.groupsByPath.get("0"));
        layout.receiveTree(tree);
        return tree;
    };
    //lastAppliedLayout_nodePositions: Map<string, Vector2>|n;
    lastAppliedLayout_nodeLayouts = [];
    ApplyLayout = (ownLayout, direction = "leftToRight", applyAnimationModifiers = true) => {
        const treeNodes = ownLayout.nodes; // This is a getter, and pretty expensive (at scale)! So cache its value here.
        const nodeRects_base = treeNodes.map(node => GetTreeNodeBaseRect(node, direction));
        const { offset } = GetTreeNodeOffset(nodeRects_base, treeNodes, this.containerPadding);
        const nodeLayouts = treeNodes.map((node, i) => {
            return {
                treeNode: node,
                lcUserData: node.data.leftColumn_userData,
                rect_final: nodeRects_base[i].NewPosition(a => a.Plus(offset)),
            };
        });
        //const nodePositions_final = nodeRects_base.map(a=>a.Position.Plus(offset));
        //const nodePositions_final_map = new Map(treeNodes.map((node, index)=>[node.data.path, nodePositions_final[index]] as [string, Vector2]));
        // animation system, prep
        const helperTreeNodesByStablePath = new Map();
        let helperLayout_offset = new Vector2(0, 0);
        if (applyAnimationModifiers && this.animation_autorunDisposer != null && this.nextKeyframeInfo?.layout != null) {
            const helperLayout = this.nextKeyframeInfo.layout;
            const helperTreeNodes = helperLayout.nodes; // This is a getter, and pretty expensive (at scale)! So cache its value here.
            const helperNodeRects_base = helperTreeNodes.map(node => GetTreeNodeBaseRect(node, direction));
            const { offset } = GetTreeNodeOffset(helperNodeRects_base, helperTreeNodes, this.containerPadding);
            helperLayout_offset = offset;
            //const helperNodePositions_final = nodeRects_base.map(a=>a.Position.Plus(offset));
            for (const treeNode of helperTreeNodes) {
                const stablePath = this.getGroupStablePath(treeNode.data);
                helperTreeNodesByStablePath.set(stablePath, treeNode);
            }
        }
        // get old scroll relative to anchor-node
        const scrollEl = this.getScrollElFromContainerEl(this.containerEl);
        const anchorNode_oldLayout = this.anchorNode_targetFinderFunc(this.lastAppliedLayout_nodeLayouts);
        const anchorNode_newLayout = this.anchorNode_targetFinderFunc(nodeLayouts);
        let newScroll_toKeepAnchorPos;
        if (scrollEl && anchorNode_oldLayout && anchorNode_newLayout) {
            const scrollPos = new Vector2(scrollEl.scrollLeft, scrollEl.scrollTop);
            const oldScroll_relToAnchor = scrollPos.Minus(anchorNode_oldLayout.rect_final.Position);
            newScroll_toKeepAnchorPos = anchorNode_newLayout.rect_final.Position.Plus(oldScroll_relToAnchor);
            /*console.log(
                "anchorNodePath:", this.anchorNode_targetInfo?.treePath, "scrollPos:", scrollPos,
                "layoutNode_oldPos:", anchorNode_oldLayout.rect_final.Position.toString(), "layoutNode_newPos:", anchorNode_newLayout.rect_final.Position.toString(),
                "oldScroll_relToAnchor:", oldScroll_relToAnchor.toString(), "newScroll_toKeepAnchorPos:", newScroll_toKeepAnchorPos.toString()
            );*/
        }
        for (const [i, node] of treeNodes.entries()) {
            const group = node.data;
            if (group.leftColumnEl == null)
                continue;
            group.assignedPosition = nodeLayouts[i].rect_final.Position;
            group.assignedPosition_final = group.assignedPosition;
            // animation system, apply
            if (applyAnimationModifiers && this.animation_autorunDisposer != null && this.nextKeyframeInfo?.layout != null) {
                const groupStablePath = this.getGroupStablePath(group);
                const helperTreeNode = helperTreeNodesByStablePath.get(groupStablePath);
                if (helperTreeNode) {
                    //const helperGroup = helperTreeNode.data;
                    const helperGroup_position = GetTreeNodeBaseRect(helperTreeNode, direction).Position.Plus(helperLayout_offset);
                    group.assignedPosition_final = InterpolateVector(group.assignedPosition, helperGroup_position, this.nextKeyframeInfo.percentThroughTransition);
                }
            }
            const newRect = group.LCRect;
            if (!newRect?.Equals(group.lcRect_atLastRender)) {
                group.leftColumnEl.style.left = `${group.assignedPosition_final.x}px`;
                //group.leftColumnEl.style.left = `calc(${group.assignedPosition_final.x}px - ${group.innerUIRect!.width / 2}px)`;
                group.leftColumnEl.style.top = `${group.assignedPosition_final.y}px`;
                //group.leftColumnEl.style.top = `calc(${group.assignedPosition_final.y}px - ${Number(group.innerUISize!.y / 2)}px)`;
                //console.log(`For ${group.path}, assigned pos: ${group.assignedPosition}`);
                // if this is our first render/layout, clear the style that had made our node invisible
                if (group.leftColumnEl_layoutCount == 0)
                    this.layoutOpts.styleSetter_layoutDone?.(group.leftColumnEl.style);
                group.leftColumnEl_layoutCount++;
                group.lcRect_atLastRender = newRect;
                group.innerUIRect_atLastRender = group.InnerUIRect;
            }
        }
        if (scrollEl && newScroll_toKeepAnchorPos) {
            scrollEl.scrollTo({ left: newScroll_toKeepAnchorPos.x, top: newScroll_toKeepAnchorPos.y });
            /*scrollEl.scrollLeft = newScroll_toKeepAnchorPos.x;
            scrollEl.scrollTop = newScroll_toKeepAnchorPos.y;*/
        }
        this.spaceTakerComp?.forceUpdate();
        this.connectorLinesComp?.forceUpdate();
        this.lastAppliedLayout_nodeLayouts = nodeLayouts;
    };
}
export function GetTreeNodeBaseRect(treeNode, direction = "leftToRight") {
    // Why do we flip x and y in our regular case? Because the algorithm defaults to top-to-bottom layout, but we want left-to-right.
    const newPos = direction == "topToBottom"
        // Why do we include the `- (treeNode.xSize / 2)` adjustment?
        // Situation: The core algorithm (probably for simpler algorithm-implementation) considers a node's position to be the center of its toward-y-origin edge (ie. pos.x is rect-centered).
        // Response: Recalculate its returned rects, so that the rest of the code (ie. outside of the core algorithm) deals with "regular rects", ie. where its [x,y] point equals its toward-origin corner.
        ? new VRect(treeNode.x - (treeNode.xSize / 2), treeNode.y, treeNode.xSize, treeNode.ySize)
        : new VRect(treeNode.y, treeNode.x - (treeNode.xSize / 2), treeNode.ySize, treeNode.xSize);
    return newPos;
}
export function GetTreeNodeOffset(baseRects, treeNodes, containerPadding) {
    const minX = CE(baseRects.map((rect, i) => rect.x)).Min();
    const maxX = CE(baseRects.map((rect, i) => rect.Right)).Min();
    const minY = CE(baseRects.map((rect, i) => rect.y)).Min();
    /*const minY = CE(baseRects.map((rect, i)=>{
        const group = treeNodes[i].data;
        // shift-up the actual box by half of box's height (lets position be used for connector-line targeting)
        return rect.y - Number(group.innerUISize!.y / 2);
    })).Min();*/
    const maxY = CE(baseRects.map((rect, i) => rect.Bottom)).Max();
    const offset = new Vector2(containerPadding.left - minX, containerPadding.top - minY);
    return { minX, maxX, minY, maxY, offset };
}
/*export class GraphPassInfo {
    treePath: string;
}*/ 
