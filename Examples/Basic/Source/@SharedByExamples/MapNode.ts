import {RequiredBy} from "./Utils/General";

export class MapNode {
	constructor(data?: RequiredBy<Partial<MapNode>, "id">) {
		Object.assign(this, data);
		if (this.text == null) this.text = `My id is "${this.id}", and this is my text.`;
	}
	id: string;
	text: string;
	width = 300;
	childrenBelow = false;
	children: MapNode[] = [];
}