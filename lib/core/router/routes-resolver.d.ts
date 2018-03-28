/// <reference types="koa" />
import * as Application from 'koa';
import * as Router from 'koa-router';
import { NeskContainer, InstanceWrapper } from '../injector/container';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { Resolver } from './interfaces/resolver.interface';
import { ApplicationConfig } from './../application-config';
import { NotFoundException } from '@neskjs/common';
export declare class RoutesResolver implements Resolver {
    private readonly container;
    private readonly koaAdapter;
    private readonly config;
    private readonly logger;
    private readonly routerProxy;
    private readonly routerExceptionsFilter;
    private readonly routerBuilder;
    constructor(container: NeskContainer, koaAdapter: any, config: ApplicationConfig);
    resolve(router: any, koa: Application): void;
    setupRouters(routes: Map<string, InstanceWrapper<Controller>>, moduleName: string, modulePath: string, koaRouter: Router): void;
    setupErrorHandler(koa: Application): void;
    mapExternalException(ctx: any): NotFoundException;
}
