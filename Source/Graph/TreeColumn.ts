import {CE, VRect} from "js-vextensions";
import {NodeGroupInfo} from "../Graph.js";

export class TreeColumn {
	constructor(data?: Partial<TreeColumn>) {
		Object.assign(this, data);
	}
	rect: VRect;

	/** Sorted by tree-path, at insert time. */
	groups_ordered: NodeGroupInfo[] = [];
	AddGroup(group: NodeGroupInfo) {
		let i = 0;
		// keep increasing i, while we keep seeing elements that we should be inserted after
		while (this.groups_ordered[i] != null && this.groups_ordered[i].ParentPath_Sortable < group.ParentPath_Sortable) {
			i++;
		}
		CE(this.groups_ordered).Insert(i, group);
	}
	RemoveGroup(group: NodeGroupInfo) {
		CE(this.groups_ordered).Remove(group);
	}

	GetNodeGroupInfo(groupElement: HTMLElement) {
		return this.groups_ordered.find(a=>a.element == groupElement);
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
	FindNextGroupInVSpace(group: NodeGroupInfo) {
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
	}
}