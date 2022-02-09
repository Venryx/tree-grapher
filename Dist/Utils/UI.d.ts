import React from "react";
import { CSSProperties } from "react";
export declare type FixHTMLProps<T> = Omit<T, "title"> & {
    title?: any;
};
export declare type HTMLProps_Fixed<T extends keyof JSX.IntrinsicElements> = Omit<FixHTMLProps<JSX.IntrinsicElements[T]>, "ref">;
export declare type ConvertType_ConvertFields_UndefToUndefOrNull<T extends object> = {
    [K in keyof T]: ConvertType_UndefToUndefOrNull<T[K]>;
};
export declare type ConvertType_UndefToUndefOrNull<T> = T extends undefined ? (undefined | null) : T;
export declare type Style = ConvertType_ConvertFields_UndefToUndefOrNull<React.CSSProperties>;
export declare type StyleOrFalsy = Style | "" | 0 | false | null | undefined;
export declare function css(...styles: CSSProperties[]): React.CSSProperties;
export declare function useForceUpdate(): () => void;
export declare class StripesOptions {
    /** Range: 0-360 */
    angle: number;
    backgroundColor: string;
    backgroundThickness: number;
    stripeColor: string;
    stripThickness: number;
}
export declare function StripesCSS(options: Partial<StripesOptions>): string;
