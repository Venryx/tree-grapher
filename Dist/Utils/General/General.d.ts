import { VRect } from "js-vextensions";
/** Element's bounding-rect relative to the page, ie. the top-left pixel when scrolled to the very top of the page. (so y = GetViewportRect().y + window.pageYOffset) */
export declare function GetPageRect(el: Element): VRect;
/** Get bounding-rect of element-x relative to element-y. */
export declare function GetRectRelative(x: Element, y: Element): VRect;
export declare function CSSScalarToPixels(scalar: string): number;
export declare function GetMarginTopFromStyle(style: CSSStyleDeclaration): number;
export declare function GetPaddingTopFromStyle(style: CSSStyleDeclaration): number;
