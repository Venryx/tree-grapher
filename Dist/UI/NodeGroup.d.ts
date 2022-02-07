/// <reference types="react" />
import type { FlashComp } from "ui-debug-kit";
export declare function useNodeGroup(treePath: string, uiDebugKit?: {
    FlashComp: typeof FlashComp;
}): {
    ref: import("react").MutableRefObject<HTMLElement | null>;
};
