import { InstanceWrapper } from '@neskjs/core/injector/container';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { ListenersController } from './listeners-controller';
import { CustomTransportStrategy } from './interfaces';
import { Server } from './server/server';
import { ClientsContainer } from './container';
import { RpcContextCreator } from './context/rpc-context-creator';
import { RpcProxy } from './context/rpc-proxy';
import { ExceptionFiltersContext } from './context/exception-filters-context';
import { PipesContextCreator } from '@neskjs/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@neskjs/core/pipes/pipes-consumer';
import { GuardsContextCreator } from '@neskjs/core/guards/guards-context-creator';
import { RuntimeException } from '@neskjs/core/errors/exceptions/runtime.exception';
import { GuardsConsumer } from '@neskjs/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@neskjs/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@neskjs/core/interceptors/interceptors-consumer';

export class MicroservicesModule {
  private readonly clientsContainer = new ClientsContainer();
  private listenersController: ListenersController;

  public setup(container, config) {
    const contextCreator = new RpcContextCreator(
      new RpcProxy(),
      new ExceptionFiltersContext(config),
      new PipesContextCreator(config),
      new PipesConsumer(),
      new GuardsContextCreator(container, config),
      new GuardsConsumer(),
      new InterceptorsContextCreator(container, config),
      new InterceptorsConsumer(),
    );
    this.listenersController = new ListenersController(
      this.clientsContainer,
      contextCreator,
    );
  }

  public setupListeners(container, server: Server & CustomTransportStrategy) {
    if (!this.listenersController) {
      throw new RuntimeException();
    }
    const modules = container.getModules();
    modules.forEach(({ routes }, module) =>
      this.bindListeners(routes, server, module),
    );
  }

  public setupClients(container) {
    if (!this.listenersController) {
      throw new RuntimeException();
    }
    const modules = container.getModules();
    modules.forEach(({ routes, components }) => {
      this.bindClients(routes);
      this.bindClients(components);
    });
  }

  public bindListeners(
    controllers: Map<string, InstanceWrapper<Controller>>,
    server: Server & CustomTransportStrategy,
    module: string,
  ) {
    controllers.forEach(({ instance }) => {
      this.listenersController.bindPatternHandlers(instance, server, module);
    });
  }

  public bindClients(controllers: Map<string, InstanceWrapper<Controller>>) {
    controllers.forEach(({ instance, isNotMetatype }) => {
      !isNotMetatype &&
        this.listenersController.bindClientsToProperties(instance);
    });
  }

  public close() {
    const clients = this.clientsContainer.getAllClients();
    clients.forEach(client => client.close());
    this.clientsContainer.clear();
  }
}
