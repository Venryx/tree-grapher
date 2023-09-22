import {CE, Timer} from "js-vextensions";
import {makeObservable, runInAction} from "mobx";
import {O} from "./Utils";

/*export*/ function RunInAction(name: string, action: ()=>any) {
	Object.defineProperty(action, "name", {value: name});
	return runInAction(action);
}
class FramePlayer {
	constructor() {
		makeObservable(this);
	}

	@O speed = 1;
	SetSpeed(speed: number) {
		this.speed = speed;
		this.timer.intervalInMS = (1000 / 30) / speed;
		if (this.playing) {
			this.timer.Start();
		}
	}

	@O playing = false;
	SetPlaying(playing: boolean) {
		RunInAction("NoVideoPlayer.SetPlaying", ()=>this.playing = playing);
		this.timer.Enabled = playing;
	}

	timer = new Timer(1000 / 30, ()=>{
		//this.comp.AdjustTargetTimeByFrames(2);
		store.AdjustTargetTimeByFrames(2);
	});
}

export class RootState {
	constructor() { makeObservable(this); }

	@O layoutHelper_show = false;
	@O zoomLevel = 1;

	//@O playing = false;
	//@O speed = 1;
	@O targetTime = 0;
	framePlayer = new FramePlayer();

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