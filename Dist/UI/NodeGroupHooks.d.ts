/// <reference types="react" />
import { NodeGroup } from "../Graph/NodeGroup.js";
export declare function useRef_nodeChildHolder(treePath: string, groupBelowParent?: boolean): {
    ref_childHolder: import("react").MutableRefObject<HTMLElement | null>;
    ref_group: import("react").MutableRefObject<NodeGroup | null>;
};
