export class Wave {
    constructor(graph, down_startGroup, messages, sourceWave) {
        this.down_visitedGroups = new Set();
        this.up_visitedGroups = new Set();
        this.down_nextIteration_groups = [];
        this.up_nextIteration_groups = [];
        this.messages = [];
        this.echoWaves = [];
        this.graph = graph;
        this.down_startGroup = down_startGroup;
        this.messages = messages;
        this.sourceWave = sourceWave;
    }
    Down_StartWave() {
        console.log("Down-wave started. @sender:", this.messages[0].sender, "@startGroup:", this.down_startGroup.path, "@wave:", this);
        this.down_nextIteration_groups = [this.down_startGroup];
        while (this.down_nextIteration_groups.length) {
            const groups = this.down_nextIteration_groups;
            let nextIterGroups = [];
            for (const group of groups) {
                this.down_visitedGroups.add(group);
                group.ReceiveDownWave(this);
                const childGroups = this.graph.FindChildGroups(group);
                nextIterGroups.push(...childGroups);
            }
            this.down_nextIteration_groups = nextIterGroups;
        }
        this.Up_StartWave();
    }
    Up_StartWave() {
        const visited_leaves = [...this.down_visitedGroups].filter(a => this.graph.FindChildGroups(a).length == 0);
        this.up_nextIteration_groups = visited_leaves;
        console.log("Up-wave started. @startGroups:", visited_leaves.map(a => a.path).join(","), "@wave:", this);
        while (this.up_nextIteration_groups.length) {
            const groups = this.up_nextIteration_groups;
            let nextIterGroups = [];
            for (const group of groups) {
                this.up_visitedGroups.add(group);
                group.ReceiveUpWave(this);
                const parentGroup = this.graph.FindParentGroup(group);
                if (parentGroup)
                    nextIterGroups.push(parentGroup);
            }
            this.up_nextIteration_groups = nextIterGroups;
        }
        for (const echoWave of this.echoWaves) {
            echoWave.Down_StartWave();
        }
    }
}
