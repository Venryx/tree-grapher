import {CE} from "js-vextensions";
import {makeObservable} from "mobx";
import {O} from "./Utils";

export class RootState {
	constructor() { makeObservable(this); }

	@O playing = false;
	@O speed = 1;
	@O targetTime = 0;

	AdjustTargetTimeByFrames(frameDelta: number) {
		const newTargetTime = (this.targetTime ?? 0) + (frameDelta * (1 / 60));
		this.SetTargetTime(CE(newTargetTime).KeepAtLeast(0));
	}
	SetTargetTime(newTargetTime: number) {
		this.targetTime = newTargetTime;
	}
}

export const store = new RootState();
G({store});