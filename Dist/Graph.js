import { CE } from "js-vextensions";
import { GetPageRect } from "./Utils/General/General.js";
export class Graph {
    constructor() {
        this.nodeGroupInfos = [];
    }
    GetNodeGroupInfo(groupElement) {
        return this.nodeGroupInfos.find(a => a.element == groupElement);
    }
    NotifyNodeGroupRendered(element, treePath) {
        const rect = GetPageRect(element);
        const entry = new NodeGroupInfo({
            parentPath: treePath,
            element,
            rect,
        });
        this.nodeGroupInfos.push(entry);
        return entry;
    }
    NotifyNodeGroupUnrendered(group) {
        CE(this.nodeGroupInfos).Remove(group);
    }
    // we only need to find the lowest earlier-group, because it will take care of positioning below its own earlier-groups
    /*GetInfoForAvoidingEarlierGroupsInVSpace(group: NodeGroupInfo) {
        const rect_fullVertical = group.rect.NewTop(0).NewBottom(Number.MAX_SAFE_INTEGER);
        let groupsInVertSpace = this.nodeGroupInfos.filter(a=>a.rect.Intersects(rect_fullVertical));
        const groupsInVertSpace_earlier = groupsInVertSpace.filter(a=>a.ParentPath_Sortable < group.ParentPath_Sortable);
        if (groupsInVertSpace_earlier.length == 0) return CE(0 - group.rect.Top).KeepAtLeast(0);

        //const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).Max(a=>a.rect.Bottom);
        const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).OrderBy(a=>a.ParentPath_Sortable).slice(-1)[0];
        const shiftNeeded = CE(groupsInVertSpace_earlier_lowest.rect.Bottom - group.rect.Top).KeepAtLeast(0);
        return {
            groupsInVertSpace_earlier_lowest,
            shiftNeeded,
        };
    }*/
    // we only need to find the next group (ie. the group just below), because we already take care of positioning outself below our earlier-groups
    FindNextGroupInVSpace(group) {
        const rect_fullVertical = group.rect.NewTop(0).NewBottom(Number.MAX_SAFE_INTEGER);
        let groupsInVertSpace = this.nodeGroupInfos.filter(a => a.rect.Intersects(rect_fullVertical));
        const groupsInVertSpace_earlier = groupsInVertSpace.filter(a => a.ParentPath_Sortable < group.ParentPath_Sortable);
        if (groupsInVertSpace_earlier.length == 0)
            return CE(0 - group.rect.Top).KeepAtLeast(0);
        //const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).Max(a=>a.rect.Bottom);
        const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).OrderBy(a => a.ParentPath_Sortable).slice(-1)[0];
        const shiftNeeded = CE(groupsInVertSpace_earlier_lowest.rect.Bottom - group.rect.Top).KeepAtLeast(0);
        return {
            groupsInVertSpace_earlier_lowest,
            shiftNeeded,
        };
    }
}
Graph.main = new Graph();
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
