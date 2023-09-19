import { VRect } from "js-vextensions";
/** Element's bounding-rect relative to the page, ie. the top-left pixel when scrolled to the very top of the page. (so y = GetViewportRect().y + window.pageYOffset) */
export declare function GetPageRect(el: Element): VRect;
/** Get bounding-rect of element-x relative to element-y. */
export declare function GetRectRelative(x: Element, y: Element): VRect;
export declare function CSSScalarToPixels(scalar: string): number;
export declare function GetMarginTopFromStyle(style: CSSStyleDeclaration): number;
export declare function GetPaddingTopFromStyle(style: CSSStyleDeclaration): number;
export declare function StrForChange(oldVal: any, newVal: any): string;
type Args<R, O> = R & Partial<O>;
export declare function Args<RequiredData, OptionalData>(requiredData: RequiredData, optionalData: OptionalData): RequiredData & Partial<OptionalData>;
export declare function UnwrapArgs<T>(args: T, defaultArgs: T): T;
export declare function Method<T, T2, ReturnType>(defaultArgs_required: T, defaultArgs_optional: T2, funcGetter: (finalArgs: (args: Args<T, T2>) => Args<T, T2>) => (args: Args<T, T2>) => ReturnType): (args: Args<T, T2>) => ReturnType;
export declare function ROSizeArrToStr(sizes: readonly ResizeObserverSize[]): string;
export {};
