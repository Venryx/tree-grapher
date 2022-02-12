import { NodeGroup } from "../Graph/NodeGroup.js";
import { Graph } from "../index.js";
import { Message } from "./Messages.js";
export declare class Wave {
    static lastWaveID: number;
    constructor(graph: Graph, down_startGroup: NodeGroup, messages: Message[], sourceWave?: Wave);
    id: number;
    graph: Graph;
    down_startGroup: NodeGroup;
    phase: "down" | "up" | "echo";
    sourceWave?: Wave;
    down_visitedGroups: Set<NodeGroup>;
    up_visitedGroups: Set<NodeGroup>;
    down_nextIteration_groups: Set<NodeGroup>;
    up_nextIteration_groups: Set<NodeGroup>;
    private messages;
    get Messages(): readonly Message[];
    AddMessage(msg: Message): void;
    private echoWaves;
    get EchoWaves(): readonly Wave[];
    AddEchoWave(wave: Wave): void;
    Down_StartWave(): void;
    Up_StartWave(): void;
}
