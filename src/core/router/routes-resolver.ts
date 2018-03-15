import { Application } from 'koa';
import { NeskContainer, InstanceWrapper } from '../injector/container';
import { RouterProxy } from './router-proxy';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { Logger } from '@neskjs/common/services/logger.service';
import { ControllerMappingMessage } from '../helpers/messages';
import { Resolver } from './interfaces/resolver.interface';
import { RouterExceptionFilters } from './router-exception-filters';
import { MetadataScanner } from '../metadata-scanner';
import { RouterExplorer } from './interfaces/explorer.inteface';
import { KoaRouterExplorer } from './router-explorer';
import { ApplicationConfig } from './../application-config';
import { NotFoundException, BadRequestException } from '@neskjs/common';
import { MODULE_PATH } from '@neskjs/common/constants';

export class RoutesResolver implements Resolver {
  private readonly logger = new Logger(RoutesResolver.name, true);
  private readonly routerProxy = new RouterProxy();
  private readonly routerExceptionsFilter: RouterExceptionFilters;
  private readonly routerBuilder: RouterExplorer;

  constructor(
    private readonly container: NeskContainer,
    private readonly koaAdapter,
    private readonly config: ApplicationConfig,
  ) {
    this.routerExceptionsFilter = new RouterExceptionFilters(config);
    this.routerBuilder = new KoaRouterExplorer(
      new MetadataScanner(),
      this.routerProxy,
      koaAdapter,
      this.routerExceptionsFilter,
      config,
      this.container,
    );
  }

  public resolve(router, koa: Application) {
    const modules = this.container.getModules();
    modules.forEach(({ routes, metatype }, moduleName) => {
      const path = metatype
        ? Reflect.getMetadata(MODULE_PATH, metatype)
        : undefined;
      this.setupRouters(routes, moduleName, path, router);
    });
    this.setupNotFoundHandler(router);
    this.setupExceptionHandler(router);
    this.setupExceptionHandler(koa);
  }

  public setupRouters(
    routes: Map<string, InstanceWrapper<Controller>>,
    moduleName: string,
    modulePath: string,
    koa: Application,
  ) {
    routes.forEach(({ instance, metatype }) => {
      const path = this.routerBuilder.fetchRouterPath(metatype, modulePath);
      const controllerName = metatype.name;

      this.logger.log(ControllerMappingMessage(controllerName, path));

      const router = this.routerBuilder.explore(instance, metatype, moduleName);
      koa.use(path, router);
    });
  }

  public setupNotFoundHandler(koa: Application) {
    const callback = (req, res) => {
      throw new NotFoundException(`Cannot ${req.method} ${req.url}`);
    };
    const exceptionHandler = this.routerExceptionsFilter.create(
      {},
      callback as any,
    );
    const proxy = this.routerProxy.createProxy(callback, exceptionHandler);
    koa.use(proxy);
  }

  public setupExceptionHandler(koa: Application) {
    const callback = (err, ctx, next) => {
      throw this.mapExternalException(err);
    };
    const exceptionHandler = this.routerExceptionsFilter.create(
      {},
      callback as any,
    );
    const proxy = this.routerProxy.createExceptionLayerProxy(
      callback,
      exceptionHandler,
    );
    koa.use(proxy);
  }

  public mapExternalException(err: any) {
    switch (true) {
      case (err instanceof SyntaxError): 
        return new BadRequestException(err.message);
      default: 
        return err; 
    }
  }
}
