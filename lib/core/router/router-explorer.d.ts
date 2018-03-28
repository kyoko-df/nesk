import 'reflect-metadata';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { RequestMethod } from '@neskjs/common/enums/request-method.enum';
import { RouterProxy, RouterProxyCallback } from './router-proxy';
import { KoaAdapter } from '../adapters/koa-adapter';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
import { ExceptionsFilter } from './interfaces/exceptions-filter.interface';
import { RouterExplorer } from './interfaces/explorer.inteface';
import { MetadataScanner } from '../metadata-scanner';
import { ApplicationConfig } from './../application-config';
import { NeskContainer } from '../injector/container';
export declare class KoaRouterExplorer implements RouterExplorer {
    private readonly metadataScanner;
    private readonly routerProxy;
    private readonly koaAdapter;
    private readonly exceptionsFilter;
    private readonly config;
    private readonly executionContextCreator;
    private readonly routerMethodFactory;
    private readonly logger;
    constructor(metadataScanner?: MetadataScanner, routerProxy?: RouterProxy, koaAdapter?: KoaAdapter, exceptionsFilter?: ExceptionsFilter, config?: ApplicationConfig, container?: NeskContainer);
    explore(instance: Controller, metatype: Metatype<Controller>, module: string): any;
    fetchRouterPath(metatype: Metatype<Controller>, prefix?: string): string;
    validateRoutePath(path: string): string;
    scanForPaths(instance: Controller, prototype?: any): RoutePathProperties[];
    exploreMethodMetadata(instance: Controller, instancePrototype: any, methodName: string): RoutePathProperties;
    applyPathsToRouterProxy(router: any, routePaths: RoutePathProperties[], instance: Controller, module: string): void;
    private applyCallbackToRouter(router, pathProperties, instance, module);
    private createCallbackProxy(instance, callback, methodName, module, requestMethod);
}
export interface RoutePathProperties {
    path: string;
    requestMethod: RequestMethod;
    targetCallback: RouterProxyCallback;
    methodName: string;
}
