import {RequiredBy} from "./Utils/General";

export class MapNode {
	constructor(data?: RequiredBy<Partial<MapNode>, "id">) {
		Object.assign(this, data);
		if (this.text == null) this.text = `My id is "${this.id}"${this.alignWithParent ? " [align with parent]" : ""}, and this is my text.`;
	}
	id: string;
	text: string;
	width = 300;
	alignWithParent = false;

	childrenBelow = false;
	children: MapNode[] = [];

	// for simplicity's sake, just have this data in the MapNode class, and mutate it
}