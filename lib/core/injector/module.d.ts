import { InstanceWrapper, NeskContainer } from './container';
import { Injectable, Controller, NeskModule, DynamicModule } from '@neskjs/common/interfaces';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
export interface CustomComponent {
    provide: any;
    name: string;
}
export declare type OpaqueToken = string | symbol | object | Metatype<any>;
export declare type CustomClass = CustomComponent & {
    useClass: Metatype<any>;
};
export declare type CustomFactory = CustomComponent & {
    useFactory: (...args) => any;
    inject?: OpaqueToken[];
};
export declare type CustomValue = CustomComponent & {
    useValue: any;
};
export declare type ComponentMetatype = Metatype<Injectable> | CustomFactory | CustomValue | CustomClass;
export declare class Module {
    private readonly _metatype;
    private readonly _scope;
    private _relatedModules;
    private _components;
    private _injectables;
    private _routes;
    private _exports;
    constructor(_metatype: NeskModuleMetatype, _scope: NeskModuleMetatype[], container: NeskContainer);
    readonly scope: NeskModuleMetatype[];
    readonly relatedModules: Set<Module>;
    readonly components: Map<string, InstanceWrapper<Injectable>>;
    readonly injectables: Map<string, InstanceWrapper<Injectable>>;
    readonly routes: Map<string, InstanceWrapper<Controller>>;
    readonly exports: Set<string>;
    readonly instance: NeskModule;
    readonly metatype: NeskModuleMetatype;
    addCoreInjectables(container: NeskContainer): void;
    addModuleRef(): void;
    addModuleAsComponent(): void;
    addReflector(): void;
    addApplicationRef(applicationRef: any): void;
    addExternalContextCreator(container: NeskContainer): void;
    addModulesContainer(container: NeskContainer): void;
    addInjectable(injectable: Metatype<Injectable>): string;
    addComponent(component: ComponentMetatype): string;
    isCustomProvider(component: ComponentMetatype): component is CustomClass | CustomFactory | CustomValue;
    addCustomProvider(component: CustomFactory | CustomValue | CustomClass, collection: Map<string, any>): string;
    isCustomClass(component: any): component is CustomClass;
    isCustomValue(component: any): component is CustomValue;
    isCustomFactory(component: any): component is CustomFactory;
    isDynamicModule(exported: any): exported is DynamicModule;
    addCustomClass(component: CustomClass, collection: Map<string, any>): void;
    addCustomValue(component: CustomValue, collection: Map<string, any>): void;
    addCustomFactory(component: CustomFactory, collection: Map<string, any>): void;
    addExportedComponent(exportedComponent: ComponentMetatype | string | DynamicModule): Set<string>;
    addCustomExportedComponent(exportedComponent: CustomFactory | CustomValue | CustomClass): Set<string>;
    addRoute(route: Metatype<Controller>): void;
    addRelatedModule(relatedModule: any): void;
    replace(toReplace: any, options: any): string;
    createModuleRefMetatype(components: any): {
        new (): {
            readonly components: any;
            get<T>(type: OpaqueToken): T;
        };
    };
}
