import {MapNode} from "./MapNode";

export const nodeTree_main = new MapNode({
	id: "1",
	children: [
		new MapNode({
			id: "1.1",
			children: [
				new MapNode({
					id: "1.1.1",
					children: [
					],
				}),
				new MapNode({
					id: "1.1.2",
					children: [
					],
				}),
			],
		}),
		new MapNode({
			id: "1.2",
			children: [
				new MapNode({
					id: "1.2.1",
					children: [
					],
				}),
				new MapNode({
					id: "1.2.2",
					children: [
					],
				}),
			],
		}),
	],
});