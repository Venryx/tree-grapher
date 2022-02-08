import {VRect} from "js-vextensions";

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
	var xRect = VRect.FromLTWH(x.getBoundingClientRect());
	var yRect = VRect.FromLTWH(y.getBoundingClientRect());
	return xRect.NewPosition(pos=>pos.Minus(yRect.Position));
}

export function GetMarginTopFromStyle(style: CSSStyleDeclaration) {
	if (style.marginTop == "") return 0;
	if (style.marginTop.includes("px")) return parseFloat(style.marginTop);
	return 0; // ignores %-margins and such (we don't use %-margins in tree-grapher)
}
export function GetPaddingTopFromStyle(style: CSSStyleDeclaration) {
	if (style.paddingTop == "") return 0;
	if (style.paddingTop.includes("px")) return parseFloat(style.paddingTop);
	return 0; // ignores %-paddings and such (we don't use %-paddings in tree-grapher)
}