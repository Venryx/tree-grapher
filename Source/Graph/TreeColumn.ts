import {Assert, CE, VRect} from "js-vextensions";
import {n, RequiredBy} from "../Utils/@Internal/Types.js";
import {NodeGroup} from "./NodeGroup.js";

export class TreeColumn {
	constructor(data?: RequiredBy<Partial<TreeColumn>, "index">) {
		Object.assign(this, data);
	}
	index: number; // mostly for debugging
	rect: VRect;

	/** Sorted by tree-path, at insert time. */
	groups_ordered: NodeGroup[] = [];
	AddGroup(group: NodeGroup) {
		let i = 0;
		// keep increasing i, while we keep seeing elements that we should be inserted after
		while (this.groups_ordered[i] != null && this.groups_ordered[i].ParentPath_Sortable <= group.ParentPath_Sortable) {
			Assert(this.groups_ordered[i].path != group.path, `Tried to insert a group for a path that already exists! @path:${group.path}`);
			i++;
		}
		CE(this.groups_ordered).Insert(i, group);
		//this.groups_ordered[i + 1]?.RecalculateShift();
	}
	RemoveGroup(group: NodeGroup) {
		const index = this.groups_ordered.indexOf(group);
		CE(this.groups_ordered).RemoveAt(index);
		//this.groups_ordered[index]?.RecalculateShift();
	}

	GetNodeGroupInfo(childHolderEl: HTMLElement) {
		return this.groups_ordered.find(a=>a.childHolderEl == childHolderEl);
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
	FindPreviousGroup(group: NodeGroup): NodeGroup|n {
		const ownIndex = this.groups_ordered.indexOf(group);
		for (let i = ownIndex - 1; i >= 0; i--) {
			const group2 = this.groups_ordered[i];
			if (group2.childHolderEl == null || group2.chRect == null) continue; // group is collapsed, so has no rect to care about
			if (group2.chRect.width == 0 || group2.chRect.height == 0) continue; // a width/height of 0 is invisible, so consider collapsed/irrelevant here too
			if (IsXAncestorOfY(group2.path, group.path)) continue;
			//if (IsXAncestor_OrSiblingOfAncestor_OfY(group2.path, group.path)) continue;
			return group2;
		}
		return null;
	}
	FindNextGroup(group: NodeGroup): NodeGroup|n {
		const ownIndex = this.groups_ordered.indexOf(group);
		for (let i = ownIndex + 1; i < this.groups_ordered.length; i++) {
			const group2 = this.groups_ordered[i];
			if (group2.childHolderEl == null || group2.chRect == null) continue; // group is collapsed, so has no rect to care about
			if (group2.chRect.width == 0 || group2.chRect.height == 0) continue; // a width/height of 0 is invisible, so consider collapsed/irrelevant here too
			if (IsXAncestorOfY(group2.path, group.path)) continue;
			//if (IsXAncestor_OrSiblingOfAncestor_OfY(group2.path, group.path)) continue;
			return group2;
		}
		return null;
	}
}

export function IsXAncestorOfY(xPath: string, yPath: string) {
	return yPath.startsWith(`${xPath}/`);
}
export function IsXAncestor_OrSiblingOfAncestor_OfY(xPath: string, yPath: string) {
	const xIsAncestor = IsXAncestorOfY(xPath, yPath);
	const xParts = xPath.split("/");
	const xParentPath = xParts.slice(0, -1).join("/");
	//const yParts = yPath.split("/");
	
	const xParentIsAncestor = yPath.startsWith(`${xParentPath}/`);
	const xIsSiblingOfAncestor = !xIsAncestor && xParentIsAncestor;
	
	return xIsAncestor || xIsSiblingOfAncestor;
}