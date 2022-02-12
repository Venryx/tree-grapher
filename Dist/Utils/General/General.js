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
// for debugging-related logs and/or flash-kit entries
export function StrForChange(oldVal, newVal) {
    const oldStr = "" + oldVal;
    const newStr = "" + newVal;
    const rightStr = newStr == oldStr ? "[same]" : newStr;
    return `${oldStr}->${rightStr}`;
}
export function Args(requiredData, optionalData) {
    return Object.assign({}, requiredData, optionalData);
}
export function UnwrapArgs(args, defaultArgs) {
    return Object.assign({}, defaultArgs, args);
}
export function Method(defaultArgs_required, defaultArgs_optional, funcGetter // to return this "method itself"
) {
    const defaultArgs = Args(defaultArgs_required, defaultArgs_optional);
    const FinalArgs = (args) => {
        return Object.assign({}, defaultArgs, args);
    };
    const func = funcGetter(FinalArgs);
    return func;
}
export function ROSizeArrToStr(sizes) {
    const stringifiableCopy = sizes.map(size => {
        return { inlineSize: size.inlineSize, blockSize: size.blockSize };
    });
    return JSON.stringify(stringifiableCopy);
}
