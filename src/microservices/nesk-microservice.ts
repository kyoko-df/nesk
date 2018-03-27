import * as optional from 'optional';
import iterate from 'iterare';
import { NeskContainer } from '@neskjs/core/injector/container';
import { MicroservicesModule } from './microservices-module';
import { messages } from '@neskjs/core/constants';
import { Logger } from '@neskjs/common/services/logger.service';
import { Server } from './server/server';
import { MicroserviceConfiguration } from './interfaces/microservice-configuration.interface';
import { ServerFactory } from './server/server-factory';
import { Transport } from './enums/transport.enum';
import {
  INeskMicroservice,
  WebSocketAdapter,
  CanActivate,
  PipeTransform,
  NeskInterceptor,
  ExceptionFilter,
  OnModuleInit,
} from '@neskjs/common';
import { ApplicationConfig } from '@neskjs/core/application-config';
import { CustomTransportStrategy } from '@neskjs/microservices';
import { Module } from '@neskjs/core/injector/module';
import { isNil, isUndefined } from '@neskjs/common/utils/shared.utils';
import { OnModuleDestroy } from '@neskjs/common/interfaces';
import { NeskApplicationContext } from '@neskjs/core/nesk-application-context';

const { SocketModule } =
  optional('@neskjs/websockets/socket-module') || ({} as any);
const { IoAdapter } =
  optional('@neskjs/websockets/adapters/io-adapter') || ({} as any);

export class NeskMicroservice extends NeskApplicationContext
  implements INeskMicroservice {
  private readonly logger = new Logger(NeskMicroservice.name, true);
  private readonly microservicesModule = new MicroservicesModule();
  private readonly socketModule = SocketModule ? new SocketModule() : null;
  private readonly microserviceConfig: MicroserviceConfiguration;
  private readonly server: Server & CustomTransportStrategy;
  private isTerminated = false;
  private isInitialized = false;
  private isInitHookCalled = false;

  constructor(
    container: NeskContainer,
    config: MicroserviceConfiguration = {},
    private readonly applicationConfig: ApplicationConfig,
  ) {
    super(container, [], null);
  
    const ioAdapter = IoAdapter ? new IoAdapter() : null;
    this.applicationConfig.setIoAdapter(ioAdapter);
    this.microservicesModule.setup(container, this.applicationConfig);
    this.microserviceConfig = {
      transport: Transport.TCP,
      ...config,
    };
    const { strategy } = config;
    this.server = strategy
      ? strategy
      : ServerFactory.create(this.microserviceConfig);
    
    this.selectContextModule();
  }

  public setupModules() {
    this.socketModule && this.socketModule.setup(this.container, this.applicationConfig);
    this.microservicesModule.setupClients(this.container);

    this.setupListeners();
    this.setIsInitialized(true);

    !this.isInitHookCalled && this.callInitHook();
  }

  public setupListeners() {
    this.microservicesModule.setupListeners(this.container, this.server);
  }

  public useWebSocketAdapter(adapter: WebSocketAdapter): this {
    this.applicationConfig.setIoAdapter(adapter);
    return this;
  }

  public useGlobalFilters(...filters: ExceptionFilter[]): this {
    this.applicationConfig.useGlobalFilters(...filters);
    return this;
  }

  public useGlobalPipes(...pipes: PipeTransform<any>[]): this {
    this.applicationConfig.useGlobalPipes(...pipes);
    return this;
  }

  public useGlobalInterceptors(...interceptors: NeskInterceptor[]): this {
    this.applicationConfig.useGlobalInterceptors(...interceptors);
    return this;
  }

  public useGlobalGuards(...guards: CanActivate[]): this {
    this.applicationConfig.useGlobalGuards(...guards);
    return this;
  }

  public listen(callback: () => void) {
    !this.isInitialized && this.setupModules();

    this.logger.log(messages.MICROSERVICE_READY);
    this.server.listen(callback);
  }

  public async listenAsync(): Promise<any> {
    return await new Promise((resolve) => this.listen(resolve));
  }

  public close() {
    this.server.close();
    !this.isTerminated && this.closeApplication();
  }

  public setIsInitialized(isInitialized: boolean) {
    this.isInitialized = isInitialized;
  }

  public setIsTerminated(isTerminaed: boolean) {
    this.isTerminated = isTerminaed;
  }

  public setIsInitHookCalled(isInitHookCalled: boolean) {
    this.isInitHookCalled = isInitHookCalled;
  }

  private closeApplication() {
    this.socketModule && this.socketModule.close();

    this.callDestroyHook();
    this.setIsTerminated(true);
  }

  private callInitHook() {
    const modules = this.container.getModules();
    modules.forEach(module => {
      this.callModuleInitHook(module);
    });
    this.setIsInitHookCalled(true);
  }

  private callModuleInitHook(module: Module) {
    const components = [...module.routes, ...module.components];
    iterate(components)
      .map(([key, { instance }]) => instance)
      .filter(instance => !isNil(instance))
      .filter(this.hasOnModuleInitHook)
      .forEach(instance => (instance as OnModuleInit).onModuleInit());
  }

  private hasOnModuleInitHook(instance): instance is OnModuleInit {
    return !isUndefined((instance as OnModuleInit).onModuleInit);
  }

  private callDestroyHook() {
    const modules = this.container.getModules();
    modules.forEach(module => {
      this.callModuleDestroyHook(module);
    });
  }

  private callModuleDestroyHook(module: Module) {
    const components = [...module.routes, ...module.components];
    iterate(components)
      .map(([key, { instance }]) => instance)
      .filter(instance => !isNil(instance))
      .filter(this.hasOnModuleDestroyHook)
      .forEach(instance => (instance as OnModuleDestroy).onModuleDestroy());
  }

  private hasOnModuleDestroyHook(instance): instance is OnModuleDestroy {
    return !isUndefined((instance as OnModuleDestroy).onModuleDestroy);
  }
}
