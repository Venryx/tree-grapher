import {AnnotationsMap, CreateObservableOptions, makeObservable} from "mobx";

declare type NoInfer<T> = [T][T extends any ? 0 : never];
export function makeObservable_safe<T extends object, AdditionalKeys extends PropertyKey = never>(target: T, annotations?: AnnotationsMap<T, NoInfer<AdditionalKeys>>, options?: CreateObservableOptions): T {
	if (annotations) {
		// for each annotated property, make sure the property exists (by setting it to undefined), else mobx will error
		for (let key of Object.keys(annotations)) {
			if (!(key in target)) {
				target[key] = undefined;
			}
		}
	}
	return makeObservable(target, annotations, options);
}