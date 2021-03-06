import * as Application from 'koa';
import * as Router from 'koa-router';
import { NeskContainer, InstanceWrapper } from '../injector/container';
import { RouterProxy } from './router-proxy';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { Logger } from '@neskjs/common/services/logger.service';
import { ControllerMappingMessage } from '../helpers/messages';
import { Resolver } from './interfaces/resolver.interface';
import { RouterExceptionFilters } from './router-exception-filters';
import { RouterExtensionContext } from './router-extension-context';
import { MetadataScanner } from '../metadata-scanner';
import { RouterExplorer } from './interfaces/explorer.inteface';
import { KoaRouterExplorer } from './router-explorer';
import { ApplicationConfig } from './../application-config';
import { NotFoundException, BadRequestException } from '@neskjs/common';
import { MODULE_PATH } from '@neskjs/common/constants';
import { HttpStatus } from '@neskjs/common';

export class RoutesResolver implements Resolver {
  private readonly logger = new Logger(RoutesResolver.name, true);
  private readonly routerProxy = new RouterProxy(new RouterExtensionContext());
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
    koa.use(router.routes());
    koa.use(router.allowedMethods());
  }

  public setupRouters(
    routes: Map<string, InstanceWrapper<Controller>>,
    moduleName: string,
    modulePath: string,
    koaRouter: Router,
  ) {
    routes.forEach(({ instance, metatype }) => {
      const path = this.routerBuilder.fetchRouterPath(metatype, modulePath);
      const controllerName = metatype.name;

      this.logger.log(ControllerMappingMessage(controllerName, path));

      const router = this.routerBuilder.explore(instance, metatype, moduleName);
      koaRouter.use(path, router.routes(), router.allowedMethods());
    });
  }

  public setupErrorHandler(koa: Application) {
    const callback = ctx => {
      return this.mapExternalException(ctx);
    };
    const exceptionHandler = this.routerExceptionsFilter.create(
      {},
      callback as any,
    );
    const wrapperExceptionHandler = ctx => {
      const exception = callback(ctx);
      if (exception instanceof Error) {
        exceptionHandler.next(exception, ctx);
      }
    };
    const proxy = this.routerProxy.createExceptionLayerProxy(
      wrapperExceptionHandler,
    );
    koa.use(proxy);
  }

  public mapExternalException(ctx) {
    switch (ctx.status) {
      case HttpStatus.NOT_FOUND:
        return new NotFoundException(`Cannot ${ctx.method} ${ctx.url}`);
      default:
        return;
    }
  }
}
