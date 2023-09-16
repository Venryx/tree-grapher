export declare class RootState {
    constructor();
    playing: boolean;
    speed: number;
    targetTime: number;
    AdjustTargetTimeByFrames(frameDelta: number): void;
    SetTargetTime(newTargetTime: number): void;
}
export declare const store: RootState;
