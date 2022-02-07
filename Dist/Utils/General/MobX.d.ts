import { AnnotationsMap, CreateObservableOptions } from "mobx";
declare type NoInfer<T> = [T][T extends any ? 0 : never];
export declare function makeObservable_safe<T extends object, AdditionalKeys extends PropertyKey = never>(target: T, annotations?: AnnotationsMap<T, NoInfer<AdditionalKeys>>, options?: CreateObservableOptions): T;
export {};
