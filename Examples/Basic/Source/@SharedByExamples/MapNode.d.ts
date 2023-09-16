import { RequiredBy } from "./Utils/General";
export declare class MapNode {
    constructor(data?: RequiredBy<Partial<MapNode>, "id">);
    id: string;
    text: string;
    width: number;
    alignWithParent: boolean;
    childrenBelow: boolean;
    children: MapNode[];
}
