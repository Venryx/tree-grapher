import { Assert } from "js-vextensions";
export class Wave {
    constructor(graph, down_startGroup, messages, sourceWave) {
        this.phase = "down";
        this.down_visitedGroups = new Set();
        this.up_visitedGroups = new Set();
        this.down_nextIteration_groups = new Set();
        this.up_nextIteration_groups = new Set();
        this.messages = [];
        this.echoWaves = [];
        this.id = ++Wave.lastWaveID;
        this.graph = graph;
        this.down_startGroup = down_startGroup;
        this.messages = messages;
        this.sourceWave = sourceWave;
    }
    get Messages() { return this.messages; }
    AddMessage(msg) {
        var _a;
        this.messages.push(msg);
        (_a = this.graph.uiDebugKit) === null || _a === void 0 ? void 0 : _a.FlashComp((msg.showOnLC && msg.me.leftColumnEl) ||
            msg.me.childHolderEl, { text: `[wave:${this.id}${this.phase[0]}] ` + msg.toString() });
    }
    get EchoWaves() { return this.echoWaves; }
    AddEchoWave(wave) {
        Assert(wave.down_startGroup != this.down_startGroup, "Cannot start echo-wave with same start-group as source start-group!");
        wave.sourceWave = this;
        this.echoWaves.push(wave);
    }
    Down_StartWave() {
        // at start of wave, re-add the messages using AddMessage, so we get the flash-kit entries created (can't do it in constructor, else would cause messages from echo-waves to mix with source-wave's)
        const origMessages = this.messages;
        this.messages = [];
        for (const msg of origMessages) {
            this.AddMessage(msg);
        }
        console.log(`Down-wave${this.sourceWave != null ? " [of echo]" : ""} started. @startGroup:`, this.down_startGroup.path, "@wave:", this);
        this.down_nextIteration_groups = new Set([this.down_startGroup]);
        while (this.down_nextIteration_groups.size) {
            const groups = this.down_nextIteration_groups;
            let nextIterGroups = new Set();
            for (const group of groups) {
                this.down_visitedGroups.add(group);
                group.ReceiveDownWave(this);
                const childGroups = this.graph.FindChildGroups(group);
                for (const childGroup of childGroups) {
                    nextIterGroups.add(childGroup);
                }
            }
            this.down_nextIteration_groups = nextIterGroups;
        }
        this.phase = "up";
        this.Up_StartWave();
    }
    Up_StartWave() {
        const visited_leaves = [...this.down_visitedGroups].filter(a => this.graph.FindChildGroups(a).length == 0);
        this.up_nextIteration_groups = new Set(visited_leaves);
        console.log(`Up-wave${this.sourceWave != null ? " [of echo]" : ""} started. @startGroups:`, visited_leaves.map(a => a.path).join(","), "@wave:", this);
        while (this.up_nextIteration_groups.size) {
            const groups = this.up_nextIteration_groups;
            let nextIterGroups = new Set();
            for (const group of groups) {
                this.up_visitedGroups.add(group);
                group.ReceiveUpWave(this);
                const parentGroup = this.graph.FindParentGroup(group);
                if (parentGroup)
                    nextIterGroups.add(parentGroup);
            }
            this.up_nextIteration_groups = nextIterGroups;
        }
        this.phase = "echo";
        for (const echoWave of this.echoWaves) {
            echoWave.Down_StartWave();
        }
    }
}
Wave.lastWaveID = -1;
