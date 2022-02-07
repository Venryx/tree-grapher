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
