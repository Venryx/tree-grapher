import React from "react";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// based on: https://stackoverflow.com/a/58606536
export function useForceUpdate() {
	const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void
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
export function StripesCSS(options: Partial<StripesOptions>) {
	const opt = Object.assign(new StripesOptions(), options);
	return `repeating-linear-gradient(
		${opt.angle}deg,
		${opt.backgroundColor},
		${opt.backgroundColor} ${opt.backgroundThickness}px,
		${opt.stripeColor} ${opt.backgroundThickness}px,
		${opt.stripeColor} ${opt.stripThickness + opt.backgroundThickness}px
	)`.replace(/\s+/g, " ");
}