import 'reflect-metadata';
import {
  NeskContainer,
  InstanceWrapper,
} from '@neskjs/core/injector/container';
import { NestGateway } from './interfaces/nest-gateway.interface';
import { SocketsContainer } from './container';
import { WebSocketsController } from './web-sockets-controller';
import { Injectable } from '@neskjs/common/interfaces/injectable.interface';
import { SocketServerProvider } from './socket-server-provider';
import { GATEWAY_METADATA } from './constants';
import { ApplicationConfig } from '@neskjs/core/application-config';
import { WsContextCreator } from './context/ws-context-creator';
import { WsProxy } from './context/ws-proxy';
import { ExceptionFiltersContext } from './context/exception-filters-context';
import { PipesConsumer } from '@neskjs/core/pipes/pipes-consumer';
import { PipesContextCreator } from '@neskjs/core/pipes/pipes-context-creator';
import { GuardsContextCreator } from '@neskjs/core/guards/guards-context-creator';
import { GuardsConsumer } from '@neskjs/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@neskjs/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@neskjs/core/interceptors/interceptors-consumer';

export class SocketModule {
  private socketsContainer = new SocketsContainer();
  private webSocketsController: WebSocketsController;

  public setup(container, config) {
    this.webSocketsController = new WebSocketsController(
      new SocketServerProvider(this.socketsContainer, config),
      container,
      config,
      this.getContextCreator(container),
    );
    const modules = container.getModules();
    modules.forEach(({ components }, moduleName) =>
      this.hookGatewaysIntoServers(components, moduleName),
    );
  }

  public hookGatewaysIntoServers(
    components: Map<string, InstanceWrapper<Injectable>>,
    moduleName: string,
  ) {
    components.forEach(wrapper =>
      this.hookGatewayIntoServer(wrapper, moduleName),
    );
  }

  public hookGatewayIntoServer(
    wrapper: InstanceWrapper<Injectable>,
    moduleName: string,
  ) {
    const { instance, metatype, isNotMetatype } = wrapper;
    if (isNotMetatype) {
      return;
    }
    const metadataKeys = Reflect.getMetadataKeys(metatype);
    if (metadataKeys.indexOf(GATEWAY_METADATA) < 0) {
      return;
    }
    this.webSocketsController.hookGatewayIntoServer(
      instance as NestGateway,
      metatype,
      moduleName,
    );
  }

  public close() {
    const servers = this.socketsContainer.getAllServers();
    servers.forEach(({ server }) => server.close());
    this.socketsContainer.clear();
  }

  private getContextCreator(container): WsContextCreator {
    return new WsContextCreator(
      new WsProxy(),
      new ExceptionFiltersContext(),
      new PipesContextCreator(),
      new PipesConsumer(),
      new GuardsContextCreator(container),
      new GuardsConsumer(),
      new InterceptorsContextCreator(container),
      new InterceptorsConsumer(),
    );
  }
}
