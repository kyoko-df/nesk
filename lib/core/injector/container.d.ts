import 'reflect-metadata';
import { Controller, Injectable } from '@neskjs/common/interfaces';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
import { Module } from './module';
import { DynamicModule } from '@neskjs/common';
import { ModulesContainer } from './modules-container';
import { ApplicationConfig } from './../application-config';
export declare class NeskContainer {
    private readonly _applicationConfig;
    private readonly globalModules;
    private readonly modules;
    private readonly dynamicModulesMetadata;
    private readonly moduleTokenFactory;
    private applicationRef;
    constructor(_applicationConfig?: ApplicationConfig);
    readonly applicationConfig: ApplicationConfig | undefined;
    setApplicationRef(applicationRef: any): void;
    getApplicationRef(): any;
    addModule(metatype: NeskModuleMetatype | DynamicModule, scope: NeskModuleMetatype[]): void;
    extractMetadata(metatype: NeskModuleMetatype | DynamicModule): {
        type: NeskModuleMetatype;
        dynamicMetadata?: Partial<DynamicModule> | undefined;
    };
    isDynamicModule(module: NeskModuleMetatype | DynamicModule): module is DynamicModule;
    addDynamicMetadata(token: string, dynamicModuleMetadata: Partial<DynamicModule>, scope: NeskModuleMetatype[]): any;
    addDynamicModules(modules: any[], scope: NeskModuleMetatype[]): void;
    isGlobalModule(metatype: NeskModuleMetatype): boolean;
    addGlobalModule(module: Module): void;
    getModules(): ModulesContainer;
    addRelatedModule(relatedModule: NeskModuleMetatype | DynamicModule, token: string): void;
    addComponent(component: Metatype<Injectable>, token: string): string;
    addInjectable(injectable: Metatype<Injectable>, token: string): void;
    addExportedComponent(exportedComponent: Metatype<Injectable>, token: string): void;
    addController(controller: Metatype<Controller>, token: string): void;
    clear(): void;
    replace(toReplace: any, options: any & {
        scope: any[] | null;
    }): void;
    bindGlobalScope(): void;
    bindGlobalsToRelatedModules(module: Module): void;
    bindGlobalModuleToModule(module: Module, globalModule: Module): any;
    getDynamicMetadataByToken(token: string, metadataKey: keyof DynamicModule): any[];
}
export interface InstanceWrapper<T> {
    name: any;
    metatype: Metatype<T>;
    instance: T;
    isResolved: boolean;
    isPending?: boolean;
    done$?: Promise<void>;
    inject?: Metatype<any>[];
    isNotMetatype?: boolean;
    forwardRef?: boolean;
    async?: boolean;
}
