import 'reflect-metadata';
import { NeskContainer, InstanceWrapper } from '@neskjs/core/injector/container';
import { NestGateway } from './index';
import { Injectable } from '@neskjs/common/interfaces/injectable.interface';
import { GatewayMiddleware } from './interfaces/gateway-middleware.interface';
import { ApplicationConfig } from '@neskjs/core/application-config';
export declare class MiddlewaresInjector {
    private readonly container;
    private readonly config;
    constructor(container: NeskContainer, config: ApplicationConfig);
    inject(server: any, instance: NestGateway, module: string): void;
    reflectMiddlewaresTokens(instance: NestGateway): any[];
    applyMiddlewares(server: any, components: Map<string, InstanceWrapper<Injectable>>, tokens: any[]): void;
    bindMiddleware(token: string, components: Map<string, InstanceWrapper<Injectable>>): any;
    isGatewayMiddleware(middleware: object): middleware is GatewayMiddleware;
}
