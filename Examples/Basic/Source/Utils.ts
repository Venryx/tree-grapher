import {observable} from "mobx";

const observableWarningGivenFor = new WeakSet<Function>();
export const O = ((target: Object, propertyKey: string | symbol)=>{
	//if (target.constructor instanceof Function && !target.constructor.toString().includes("makeObservable(")) {
	if (target.constructor instanceof Function && !target.constructor.toString().includes("makeObservable")) { // transpilation makes only the raw name safe to look for
		if (!observableWarningGivenFor.has(target.constructor)) {
			console.warn(`The @O decorator was used on "${target.constructor.name}.${String(propertyKey)
				}", but the class is missing the "makeObservable(this);" call. See here for more info: https://mobx.js.org/enabling-decorators.html`);
			observableWarningGivenFor.add(target.constructor);
		}
	}
	return observable(target, propertyKey);
}) as typeof observable;
// copy ".ref", etc. fields from "observable" (not wrapped)
for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(observable))) {
	Object.defineProperty(O, key, descriptor);
}