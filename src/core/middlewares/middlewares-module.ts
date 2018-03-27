import { NeskContainer } from '../injector/container';
import { MiddlewareBuilder } from './builder';
import { MiddlewaresContainer, MiddlewareWrapper } from './container';
import { MiddlewaresResolver } from './resolver';
import { ControllerMetadata } from '@neskjs/common/interfaces/controllers/controller-metadata.interface';
import { NeskModule } from '@neskjs/common/interfaces/modules/nesk-module.interface';
import { MiddlewareConfiguration } from '@neskjs/common/interfaces/middlewares/middleware-configuration.interface';
import { InvalidMiddlewareException } from '../errors/exceptions/invalid-middleware.exception';
import { RequestMethod } from '@neskjs/common/enums/request-method.enum';
import { RoutesMapper } from './routes-mapper';
import { RouterProxy } from '../router/router-proxy';
import { RouterExtensionContext } from '../router/router-extension-context';
import { ExceptionsHandler } from '../exceptions/exceptions-handler';
import { Module } from '../injector/module';
import { RouterMethodFactory } from '../helpers/router-method-factory';
import { NeskMiddleware } from '@neskjs/common/interfaces/middlewares/nesk-middleware.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
import { RuntimeException } from '../errors/exceptions/runtime.exception';
import { isUndefined } from '@neskjs/common/utils/shared.utils';
import { ApplicationConfig } from './../application-config';
import { RouterExceptionFilters } from './../router/router-exception-filters';

export class MiddlewaresModule {
  private readonly routesMapper = new RoutesMapper();
  private readonly routerProxy = new RouterProxy(new RouterExtensionContext());
  private readonly routerMethodFactory = new RouterMethodFactory();
  private routerExceptionFilter: RouterExceptionFilters;
  private resolver: MiddlewaresResolver;

  public async setup(
    middlewaresContainer: MiddlewaresContainer,
    container: NeskContainer,
    config: ApplicationConfig,
  ) {
    this.routerExceptionFilter = new RouterExceptionFilters(config);
    this.resolver = new MiddlewaresResolver(middlewaresContainer);

    const modules = container.getModules();
    await this.resolveMiddlewares(middlewaresContainer, modules);
  }

  public async resolveMiddlewares(
    middlewaresContainer: MiddlewaresContainer,
    modules: Map<string, Module>,
  ) {
    await Promise.all(
      [...modules.entries()].map(async ([name, module]) => {
        const instance = module.instance;

        this.loadConfiguration(middlewaresContainer, instance, name);
        await this.resolver.resolveInstances(module, name);
      }),
    );
  }

  public loadConfiguration(
    middlewaresContainer: MiddlewaresContainer,
    instance: NeskModule,
    module: string,
  ) {
    if (!instance.configure) return;

    const middlewaresBuilder = new MiddlewareBuilder(this.routesMapper);
    instance.configure(middlewaresBuilder);

    if (!(middlewaresBuilder instanceof MiddlewareBuilder)) return;

    const config = middlewaresBuilder.build();
    middlewaresContainer.addConfig(config, module);
  }

  public async setupMiddlewares(
    middlewaresContainer: MiddlewaresContainer,
    app,
  ) {
    const configs = middlewaresContainer.getConfigs();
    await Promise.all(
      [...configs.entries()].map(async ([module, moduleConfigs]) => {
        await Promise.all(
          [...moduleConfigs].map(async (config: MiddlewareConfiguration) => {
            await this.setupMiddlewareConfig(
              middlewaresContainer,
              config,
              module,
              app,
            );
          }),
        );
      }),
    );
  }

  public async setupMiddlewareConfig(
    middlewaresContainer: MiddlewaresContainer,
    config: MiddlewareConfiguration,
    module: string,
    app,
  ) {
    const { forRoutes } = config;
    await Promise.all(
      forRoutes.map(
        async (route: ControllerMetadata & { method: RequestMethod }) => {
          await this.setupRouteMiddleware(
            middlewaresContainer,
            route,
            config,
            module,
            app,
          );
        },
      ),
    );
  }

  public async setupRouteMiddleware(
    middlewaresContainer: MiddlewaresContainer,
    route: ControllerMetadata & { method: RequestMethod },
    config: MiddlewareConfiguration,
    module: string,
    app,
  ) {
    const { path, method } = route;

    const middlewares = [].concat(config.middlewares);
    await Promise.all(
      middlewares.map(async (metatype: Metatype<NeskMiddleware>) => {
        const collection = middlewaresContainer.getMiddlewares(module);
        const middleware = collection.get(metatype.name);
        if (isUndefined(middleware)) {
          throw new RuntimeException();
        }

        const { instance } = middleware as MiddlewareWrapper;
        await this.setupHandler(instance, metatype, app, method, path);
      }),
    );
  }

  private async setupHandler(
    instance: NeskMiddleware,
    metatype: Metatype<NeskMiddleware>,
    app: any,
    method: RequestMethod,
    path: string,
  ) {
    if (isUndefined(instance.resolve)) {
      throw new InvalidMiddlewareException(metatype.name);
    }
    const exceptionsHandler = this.routerExceptionFilter.create(
      instance,
      instance.resolve,
    );
    const router = this.routerMethodFactory.get(app, method).bind(app);

    const setupWithProxy = middleware =>
      this.setupHandlerWithProxy(exceptionsHandler, router, middleware, path);
    const resolve = instance.resolve();
    if (!(resolve instanceof Promise)) {
      setupWithProxy(resolve);
      return;
    }
    const middleware = await resolve;
    setupWithProxy(middleware);
  }

  private setupHandlerWithProxy(
    exceptionsHandler: ExceptionsHandler,
    router: (...args) => void,
    middleware: (ctx, next) => void,
    path: string,
  ) {
    const proxy = this.routerProxy.createProxy(middleware, exceptionsHandler);
    router(path, proxy);
  }
}
