import 'reflect-metadata';
import { InstanceWrapper } from '@neskjs/core/injector/container';
import { Injectable } from '@neskjs/common/interfaces/injectable.interface';
export declare class SocketModule {
    private socketsContainer;
    private webSocketsController;
    setup(container: any, config: any): void;
    hookGatewaysIntoServers(components: Map<string, InstanceWrapper<Injectable>>, moduleName: string): void;
    hookGatewayIntoServer(wrapper: InstanceWrapper<Injectable>, moduleName: string): void;
    close(): void;
    private getContextCreator(container);
}
