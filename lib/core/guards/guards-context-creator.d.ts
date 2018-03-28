import 'reflect-metadata';
import { Controller } from '@neskjs/common/interfaces';
import { ContextCreator } from './../helpers/context-creator';
import { NeskContainer } from '../injector/container';
import { CanActivate } from '@neskjs/common';
import { ConfigurationProvider } from '@neskjs/common/interfaces/configuration-provider.interface';
export declare class GuardsContextCreator extends ContextCreator {
    private readonly container;
    private readonly config;
    private moduleContext;
    constructor(container: NeskContainer, config?: ConfigurationProvider);
    create(instance: Controller, callback: (...args) => any, module: string): CanActivate[];
    createConcreteContext<T extends any[], R extends any[]>(metadata: T): R;
    createGlobalMetadataContext<T extends any[], R extends any[]>(metadata: T): R;
    getInstanceByMetatype(metatype: any): {
        instance: any;
    } | undefined;
    getGlobalMetadata<T extends any[]>(): T;
}
