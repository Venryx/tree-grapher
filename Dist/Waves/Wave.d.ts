import { NodeGroup } from "../Graph/NodeGroup.js";
import { Graph } from "../index.js";
import { Message } from "./Messages.js";
export declare class Wave {
    constructor(graph: Graph, down_startGroup: NodeGroup, messages: Message[], sourceWave?: Wave);
    graph: Graph;
    down_startGroup: NodeGroup;
    sourceWave?: Wave;
    down_visitedGroups: Set<NodeGroup>;
    up_visitedGroups: Set<NodeGroup>;
    down_nextIteration_groups: NodeGroup[];
    up_nextIteration_groups: NodeGroup[];
    messages: Message[];
    echoWaves: Wave[];
    Down_StartWave(): void;
    Up_StartWave(): void;
}
