import { makeObservable } from "mobx";
export function makeObservable_safe(target, annotations, options) {
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
