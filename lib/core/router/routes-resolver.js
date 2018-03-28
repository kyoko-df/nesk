"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_proxy_1 = require("./router-proxy");
const logger_service_1 = require("@neskjs/common/services/logger.service");
const messages_1 = require("../helpers/messages");
const router_exception_filters_1 = require("./router-exception-filters");
const router_extension_context_1 = require("./router-extension-context");
const metadata_scanner_1 = require("../metadata-scanner");
const router_explorer_1 = require("./router-explorer");
const common_1 = require("@neskjs/common");
const constants_1 = require("@neskjs/common/constants");
const common_2 = require("@neskjs/common");
class RoutesResolver {
    constructor(container, koaAdapter, config) {
        this.container = container;
        this.koaAdapter = koaAdapter;
        this.config = config;
        this.logger = new logger_service_1.Logger(RoutesResolver.name, true);
        this.routerProxy = new router_proxy_1.RouterProxy(new router_extension_context_1.RouterExtensionContext());
        this.routerExceptionsFilter = new router_exception_filters_1.RouterExceptionFilters(config);
        this.routerBuilder = new router_explorer_1.KoaRouterExplorer(new metadata_scanner_1.MetadataScanner(), this.routerProxy, koaAdapter, this.routerExceptionsFilter, config, this.container);
    }
    resolve(router, koa) {
        const modules = this.container.getModules();
        modules.forEach(({ routes, metatype }, moduleName) => {
            const path = metatype
                ? Reflect.getMetadata(constants_1.MODULE_PATH, metatype)
                : undefined;
            this.setupRouters(routes, moduleName, path, router);
        });
        koa.use(router.routes());
        koa.use(router.allowedMethods());
    }
    setupRouters(routes, moduleName, modulePath, koaRouter) {
        routes.forEach(({ instance, metatype }) => {
            const path = this.routerBuilder.fetchRouterPath(metatype, modulePath);
            const controllerName = metatype.name;
            this.logger.log(messages_1.ControllerMappingMessage(controllerName, path));
            const router = this.routerBuilder.explore(instance, metatype, moduleName);
            koaRouter.use(path, router.routes(), router.allowedMethods());
        });
    }
    setupErrorHandler(koa) {
        const callback = ctx => {
            return this.mapExternalException(ctx);
        };
        const exceptionHandler = this.routerExceptionsFilter.create({}, callback);
        const wrapperExceptionHandler = ctx => {
            const exception = callback(ctx);
            if (exception instanceof Error) {
                exceptionHandler.next(exception, ctx);
            }
        };
        const proxy = this.routerProxy.createExceptionLayerProxy(wrapperExceptionHandler);
        koa.use(proxy);
    }
    mapExternalException(ctx) {
        switch (ctx.status) {
            case common_2.HttpStatus.NOT_FOUND:
                return new common_1.NotFoundException(`Cannot ${ctx.method} ${ctx.url}`);
            default:
                return;
        }
    }
}
exports.RoutesResolver = RoutesResolver;
