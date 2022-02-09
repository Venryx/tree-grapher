import React from "react";
import {CSSProperties} from "react";

//export type FixHTMLProps<T> = Omit<T, "title"> & {title?: string|n};
export type FixHTMLProps<T> = Omit<T, "title"> & {title?: any}; // have to use "any", else you can't destructure the fields into an element using {...rest}
//export type HTMLProps_Fixed<T> = FixHTMLProps<React.HTMLProps<T>>;

/*
There are three types of interest, when we want to get an element-type's native attributes (we'll use button as example):
- All attributes that are on any html element: React.AllHTMLAttributes<HTMLButtonElement>
- Exact native attributes for div-elements (long version): DetailedHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
- Exact native attributes for div-elements (shortcut): JSX.IntrinsicElements["button"]

The last one is the easiest to make a type-helper for, so we use it below.
*/
export type HTMLProps_Fixed<T extends keyof JSX.IntrinsicElements> =
	Omit<
		FixHTMLProps<JSX.IntrinsicElements[T]>,
		// omit these; they are only present during instance creation, and are not part of the actual html-props set (without removal, causes TS errors on using "...rest" for comp-props)
		"ref"
	>;

// css helper
// ==========

export type ConvertType_ConvertFields_UndefToUndefOrNull<T extends object> = {
	[K in keyof T]: ConvertType_UndefToUndefOrNull<T[K]>;
}
export type ConvertType_UndefToUndefOrNull<T> = T extends undefined ? (undefined | null) : T;
// Style is a "loosened" CSSProperties, which accepts "null" for any style-prop that accepts "undefined"
export type Style = ConvertType_ConvertFields_UndefToUndefOrNull<React.CSSProperties>;
export type StyleOrFalsy = Style | "" | 0 | false | null | undefined;
export function css(...styles: CSSProperties[]) {
	return Object.assign({}, ...styles) as React.CSSProperties;
}

// others
// ==========

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