import {Assert, VRect} from "js-vextensions";
import {RequiredBy} from "../@Internal/Types.js";

/** Element's bounding-rect relative to the page, ie. the top-left pixel when scrolled to the very top of the page. (so y = GetViewportRect().y + window.pageYOffset) */
export function GetPageRect(el: Element) {
	var box = el.getBoundingClientRect();
	const win = el.ownerDocument.defaultView!;
	return new VRect(
		/*box.left + (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0),
		box.top + (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop  || 0),*/
		box.left + win.pageXOffset,
		box.top + win.pageYOffset,
		box.width,
		box.height,
	);
}
/** Get bounding-rect of element-x relative to element-y. */
export function GetRectRelative(x: Element, y: Element) {
	Assert(x instanceof Element && x.getBoundingClientRect != null, "X is not an Element!");
	var xRect = VRect.FromLTWH(x.getBoundingClientRect());
	var yRect = VRect.FromLTWH(y.getBoundingClientRect());
	return xRect.NewPosition(pos=>pos.Minus(yRect.Position));
}

export function CSSScalarToPixels(scalar: string) {
	if (scalar == "") return 0;
	if (scalar.includes("px")) return parseFloat(scalar);
	return 0; // ignores %-margins and such (we don't use %-margins in tree-grapher)
}
export function GetMarginTopFromStyle(style: CSSStyleDeclaration) {
	return CSSScalarToPixels(style.marginTop);
}
export function GetPaddingTopFromStyle(style: CSSStyleDeclaration) {
	return CSSScalarToPixels(style.paddingTop);
}

// for debugging-related logs and/or flash-kit entries
export function StrForChange(oldVal: any, newVal: any) {
	const oldStr = ""+oldVal;
	const newStr = ""+newVal;
	const rightStr = newStr == oldStr ? "[same]" : newStr;
	return `${oldStr}->${rightStr}`;
}

type Args<R, O> = R & Partial<O>;
export function Args<RequiredData, OptionalData>(requiredData: RequiredData, optionalData: OptionalData) {
	return Object.assign({}, requiredData, optionalData as Partial<OptionalData>);
}
export function UnwrapArgs<T>(args: T, defaultArgs: T) {
	return Object.assign({}, defaultArgs, args);
}
export function Method<T, T2, ReturnType>(
	defaultArgs_required: T,
	defaultArgs_optional: T2,
	funcGetter:
		(finalArgs: (args: Args<T, T2>)=>Args<T, T2>)=> // this gets called at "method attachment" time
			(args: Args<T, T2>)=>ReturnType // to return this "method itself"
) {
	const defaultArgs = Args(defaultArgs_required, defaultArgs_optional);
	const FinalArgs = (args: Args<T, T2>)=>{
		return Object.assign({}, defaultArgs, args) as Args<T, T2>;
	}
	const func = funcGetter(FinalArgs);
	return func;
}

export function ROSizeArrToStr(sizes: readonly ResizeObserverSize[]) {
	const stringifiableCopy = sizes.map(size=>{
		return {inlineSize: size.inlineSize, blockSize: size.blockSize};
	});
	return JSON.stringify(stringifiableCopy);
}