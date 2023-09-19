import React from "react";
export function css(...styles) {
    return Object.assign({}, ...styles);
}
// others
// ==========
// based on: https://stackoverflow.com/a/58606536
export function useForceUpdate() {
    const forceUpdate = React.useReducer(() => ({}), {})[1];
    return forceUpdate;
}
export class StripesOptions {
    /** Range: 0-360 */
    angle = 0;
    backgroundColor = "transparent";
    backgroundThickness = 5;
    stripeColor = "rgba(255,0,0,.3)";
    stripThickness = 2;
}
export function StripesCSS(options) {
    const opt = Object.assign(new StripesOptions(), options);
    return `repeating-linear-gradient(
		${opt.angle}deg,
		${opt.backgroundColor},
		${opt.backgroundColor} ${opt.backgroundThickness}px,
		${opt.stripeColor} ${opt.backgroundThickness}px,
		${opt.stripeColor} ${opt.stripThickness + opt.backgroundThickness}px
	)`.replace(/\s+/g, " ");
}
