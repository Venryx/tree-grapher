import { VRect } from "js-vextensions";
/** Element's bounding-rect relative to the page, ie. the top-left pixel when scrolled to the very top of the page. (so y = GetViewportRect().y + window.pageYOffset) */
export function GetPageRect(el) {
    var box = el.getBoundingClientRect();
    const win = el.ownerDocument.defaultView;
    return new VRect(
    /*box.left + (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0),
    box.top + (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop  || 0),*/
    box.left + win.pageXOffset, box.top + win.pageYOffset, box.width, box.height);
}
/** Get bounding-rect of element-x relative to element-y. */
export function GetRectRelative(x, y) {
    var xRect = VRect.FromLTWH(x.getBoundingClientRect());
    var yRect = VRect.FromLTWH(y.getBoundingClientRect());
    return xRect.NewPosition(pos => pos.Minus(yRect.Position));
}
export function CSSScalarToPixels(scalar) {
    if (scalar == "")
        return 0;
    if (scalar.includes("px"))
        return parseFloat(scalar);
    return 0; // ignores %-margins and such (we don't use %-margins in tree-grapher)
}
export function GetMarginTopFromStyle(style) {
    return CSSScalarToPixels(style.marginTop);
}
export function GetPaddingTopFromStyle(style) {
    return CSSScalarToPixels(style.paddingTop);
}
