import { Assert, CE } from "js-vextensions";
export class TreeColumn {
    constructor(data) {
        /** Sorted by tree-path, at insert time. */
        this.groups_ordered = [];
        Object.assign(this, data);
    }
    AddGroup(group) {
        let i = 0;
        // keep increasing i, while we keep seeing elements that we should be inserted after
        while (this.groups_ordered[i] != null && this.groups_ordered[i].path_sortable <= group.path_sortable) {
            Assert(this.groups_ordered[i].path != group.path, `Tried to insert a group for a path that already exists! @path:${group.path}`);
            i++;
        }
        CE(this.groups_ordered).Insert(i, group);
        //this.groups_ordered[i + 1]?.RecalculateShift();
    }
    RemoveGroup(group) {
        const index = this.groups_ordered.indexOf(group);
        CE(this.groups_ordered).RemoveAt(index);
        //this.groups_ordered[index]?.RecalculateShift();
    }
    GetNodeGroupInfo(childHolderEl) {
        return this.groups_ordered.find(a => a.childHolderEl == childHolderEl);
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
    /*FindNextGroupInVSpace(group: NodeGroupInfo) {
        const rect_fullVertical = group.rect.NewTop(0).NewBottom(Number.MAX_SAFE_INTEGER);
        let groupsInVertSpace = this.groups_ordered.filter(a=>a.rect.Intersects(rect_fullVertical));
        const groupsInVertSpace_earlier = groupsInVertSpace.filter(a=>a.ParentPath_Sortable < group.ParentPath_Sortable);
        if (groupsInVertSpace_earlier.length == 0) return CE(0 - group.rect.Top).KeepAtLeast(0);

        //const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).Max(a=>a.rect.Bottom);
        const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).slice(-1)[0];
        const shiftNeeded = CE(groupsInVertSpace_earlier_lowest.rect.Bottom - group.rect.Top).KeepAtLeast(0);
        return {
            groupsInVertSpace_earlier_lowest,
            shiftNeeded,
        };
    }*/
    FindPreviousGroup(group) {
        const ownIndex = this.groups_ordered.indexOf(group);
        for (let i = ownIndex - 1; i >= 0; i--) {
            const group2 = this.groups_ordered[i];
            if (group2.childHolderEl == null || !group2.CHRect_Valid)
                continue; // group is collapsed or empty, so has no rect to care about
            if (IsXAncestorOfY(group2.path, group.path))
                continue;
            //if (IsXAncestor_OrSiblingOfAncestor_OfY(group2.path, group.path)) continue;
            return group2;
        }
        return null;
    }
    FindNextGroup(group) {
        const ownIndex = this.groups_ordered.indexOf(group);
        for (let i = ownIndex + 1; i < this.groups_ordered.length; i++) {
            const group2 = this.groups_ordered[i];
            if (group2.childHolderEl == null || !group2.CHRect_Valid)
                continue; // group is collapsed or empty, so has no rect to care about
            if (IsXAncestorOfY(group2.path, group.path))
                continue;
            //if (IsXAncestor_OrSiblingOfAncestor_OfY(group2.path, group.path)) continue;
            return group2;
        }
        return null;
    }
}
export function IsXAncestorOfY(xPath, yPath) {
    return yPath.startsWith(`${xPath}/`);
}
export function IsXAncestor_OrSiblingOfAncestor_OfY(xPath, yPath) {
    const xIsAncestor = IsXAncestorOfY(xPath, yPath);
    const xParts = xPath.split("/");
    const xParentPath = xParts.slice(0, -1).join("/");
    //const yParts = yPath.split("/");
    const xParentIsAncestor = yPath.startsWith(`${xParentPath}/`);
    const xIsSiblingOfAncestor = !xIsAncestor && xParentIsAncestor;
    return xIsAncestor || xIsSiblingOfAncestor;
}
