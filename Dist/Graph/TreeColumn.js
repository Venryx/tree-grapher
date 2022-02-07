import { CE } from "js-vextensions";
export class TreeColumn {
    constructor(data) {
        /** Sorted by tree-path, at insert time. */
        this.groups_ordered = [];
        Object.assign(this, data);
    }
    AddGroup(group) {
        var _a;
        let i = 0;
        // keep increasing i, while we keep seeing elements that we should be inserted after
        while (this.groups_ordered[i] != null && this.groups_ordered[i].ParentPath_Sortable < group.ParentPath_Sortable) {
            i++;
        }
        CE(this.groups_ordered).Insert(i, group);
        (_a = this.groups_ordered[i + 1]) === null || _a === void 0 ? void 0 : _a.RecalculateShift();
    }
    RemoveGroup(group) {
        var _a;
        const index = this.groups_ordered.indexOf(group);
        CE(this.groups_ordered).RemoveAt(index);
        (_a = this.groups_ordered[index]) === null || _a === void 0 ? void 0 : _a.RecalculateShift();
    }
    GetNodeGroupInfo(groupElement) {
        return this.groups_ordered.find(a => a.element == groupElement);
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
        let groupsInVertSpace = this.groups_ordered.filter(a => a.rect.Intersects(rect_fullVertical));
        const groupsInVertSpace_earlier = groupsInVertSpace.filter(a => a.ParentPath_Sortable < group.ParentPath_Sortable);
        if (groupsInVertSpace_earlier.length == 0)
            return CE(0 - group.rect.Top).KeepAtLeast(0);
        //const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).Max(a=>a.rect.Bottom);
        const groupsInVertSpace_earlier_lowest = CE(groupsInVertSpace_earlier).slice(-1)[0];
        const shiftNeeded = CE(groupsInVertSpace_earlier_lowest.rect.Bottom - group.rect.Top).KeepAtLeast(0);
        return {
            groupsInVertSpace_earlier_lowest,
            shiftNeeded,
        };
    }
}
