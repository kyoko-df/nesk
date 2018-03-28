"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("./builder");
const resolver_1 = require("./resolver");
const invalid_middleware_exception_1 = require("../errors/exceptions/invalid-middleware.exception");
const routes_mapper_1 = require("./routes-mapper");
const router_proxy_1 = require("../router/router-proxy");
const router_extension_context_1 = require("../router/router-extension-context");
const router_method_factory_1 = require("../helpers/router-method-factory");
const runtime_exception_1 = require("../errors/exceptions/runtime.exception");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const router_exception_filters_1 = require("./../router/router-exception-filters");
class MiddlewaresModule {
    constructor() {
        this.routesMapper = new routes_mapper_1.RoutesMapper();
        this.routerProxy = new router_proxy_1.RouterProxy(new router_extension_context_1.RouterExtensionContext());
        this.routerMethodFactory = new router_method_factory_1.RouterMethodFactory();
    }
    async setup(middlewaresContainer, container, config) {
        this.routerExceptionFilter = new router_exception_filters_1.RouterExceptionFilters(config);
        this.resolver = new resolver_1.MiddlewaresResolver(middlewaresContainer);
        const modules = container.getModules();
        await this.resolveMiddlewares(middlewaresContainer, modules);
    }
    async resolveMiddlewares(middlewaresContainer, modules) {
        await Promise.all([...modules.entries()].map(async ([name, module]) => {
            const instance = module.instance;
            this.loadConfiguration(middlewaresContainer, instance, name);
            await this.resolver.resolveInstances(module, name);
        }));
    }
    loadConfiguration(middlewaresContainer, instance, module) {
        if (!instance.configure)
            return;
        const middlewaresBuilder = new builder_1.MiddlewareBuilder(this.routesMapper);
        instance.configure(middlewaresBuilder);
        if (!(middlewaresBuilder instanceof builder_1.MiddlewareBuilder))
            return;
        const config = middlewaresBuilder.build();
        middlewaresContainer.addConfig(config, module);
    }
    async setupMiddlewares(middlewaresContainer, app) {
        const configs = middlewaresContainer.getConfigs();
        await Promise.all([...configs.entries()].map(async ([module, moduleConfigs]) => {
            await Promise.all([...moduleConfigs].map(async (config) => {
                await this.setupMiddlewareConfig(middlewaresContainer, config, module, app);
            }));
        }));
    }
    async setupMiddlewareConfig(middlewaresContainer, config, module, app) {
        const { forRoutes } = config;
        await Promise.all(forRoutes.map(async (route) => {
            await this.setupRouteMiddleware(middlewaresContainer, route, config, module, app);
        }));
    }
    async setupRouteMiddleware(middlewaresContainer, route, config, module, app) {
        const { path, method } = route;
        const middlewares = [].concat(config.middlewares);
        await Promise.all(middlewares.map(async (metatype) => {
            const collection = middlewaresContainer.getMiddlewares(module);
            const middleware = collection.get(metatype.name);
            if (shared_utils_1.isUndefined(middleware)) {
                throw new runtime_exception_1.RuntimeException();
            }
            const { instance } = middleware;
            await this.setupHandler(instance, metatype, app, method, path);
        }));
    }
    async setupHandler(instance, metatype, app, method, path) {
        if (shared_utils_1.isUndefined(instance.resolve)) {
            throw new invalid_middleware_exception_1.InvalidMiddlewareException(metatype.name);
        }
        const exceptionsHandler = this.routerExceptionFilter.create(instance, instance.resolve);
        const router = this.routerMethodFactory.get(app, method).bind(app);
        const setupWithProxy = middleware => this.setupHandlerWithProxy(exceptionsHandler, router, middleware, path);
        const resolve = instance.resolve();
        if (!(resolve instanceof Promise)) {
            setupWithProxy(resolve);
            return;
        }
        const middleware = await resolve;
        setupWithProxy(middleware);
    }
    setupHandlerWithProxy(exceptionsHandler, router, middleware, path) {
        const proxy = this.routerProxy.createProxy(middleware, exceptionsHandler);
        router(path, proxy);
    }
}
exports.MiddlewaresModule = MiddlewaresModule;
