"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("koa-cors");
const http = require("http");
const https = require("https");
const optional = require("optional");
const bodyParser = require("koa-bodyparser");
const views = require("koa-views");
const iterare_1 = require("iterare");
const logger_service_1 = require("@neskjs/common/services/logger.service");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const koa_adapter_1 = require("./adapters/koa-adapter");
const application_config_1 = require("./application-config");
const constants_1 = require("./constants");
const middlewares_module_1 = require("./middlewares/middlewares-module");
const routes_resolver_1 = require("./router/routes-resolver");
const microservices_package_not_found_exception_1 = require("./errors/exceptions/microservices-package-not-found.exception");
const container_1 = require("./middlewares/container");
const nesk_application_context_1 = require("./nesk-application-context");
const { SocketModule } = optional('@neskjs/websockets/socket-module') || {};
const { MicroservicesModule } = optional('@neskjs/microservices/microservices-module') || {};
const { NeskMicroservice } = optional('@neskjs/microservices/nesk-microservice') || {};
const { IoAdapter } = optional('@neskjs/websockets/adapters/io-adapter') || {};
class NeskApplication extends nesk_application_context_1.NeskApplicationContext {
    constructor(container, koa, config, appOptions = {}) {
        super(container, [], null);
        this.koa = koa;
        this.config = config;
        this.appOptions = appOptions;
        this.logger = new logger_service_1.Logger(NeskApplication.name, true);
        this.middlewaresModule = new middlewares_module_1.MiddlewaresModule();
        this.middlewaresContainer = new container_1.MiddlewaresContainer();
        this.microservicesModule = MicroservicesModule
            ? new MicroservicesModule()
            : null;
        this.socketModule = SocketModule ? new SocketModule() : null;
        this.httpServer = null;
        this.routesResolver = null;
        this.microservices = [];
        this.isInitialized = false;
        this.applyOptions();
        this.selectContextModule();
        this.routesResolver = new routes_resolver_1.RoutesResolver(container, koa_adapter_1.KoaAdapter, this.config);
        this.httpServer = this.createServer();
        const ioAdapter = IoAdapter ? new IoAdapter(this.httpServer) : null;
        this.config.setIoAdapter(ioAdapter);
    }
    applyOptions() {
        if (!this.appOptions || !this.appOptions.cors) {
            return undefined;
        }
        const isCorsOptionsObj = shared_utils_1.isObject(this.appOptions.cors);
        if (!isCorsOptionsObj) {
            return this.enableCors();
        }
        this.enableCors(this.appOptions.cors);
    }
    createServer() {
        if (this.appOptions && this.appOptions.httpsOptions) {
            return https.createServer(this.appOptions.httpsOptions, this.koa.callback());
        }
        return http.createServer(this.koa.callback());
    }
    async setupModules() {
        this.socketModule && this.socketModule.setup(this.container, this.config);
        if (this.microservicesModule) {
            this.microservicesModule.setup(this.container, this.config);
            this.microservicesModule.setupClients(this.container);
        }
        await this.middlewaresModule.setup(this.middlewaresContainer, this.container, this.config);
    }
    async init() {
        const useBodyParser = this.appOptions && this.appOptions.bodyParser !== false;
        useBodyParser && this.setupParserMiddlewares();
        await this.setupModules();
        await this.setupRouter();
        this.callInitHook();
        this.logger.log(constants_1.messages.APPLICATION_READY);
        this.isInitialized = true;
        return this;
    }
    setupParserMiddlewares() {
        // const parserMiddlewares = {
        //   jsonParser: bodyParser.json(),
        //   urlencodedParser: bodyParser.urlencoded({ extended: true }),
        // };
        // Object.keys(parserMiddlewares)
        //   .filter(parser => !this.isMiddlewareApplied(this.koa, parser, bodyParser))
        //   .forEach(parserKey => this.koa.use(parserMiddlewares[parserKey]));
        if (!this.isMiddlewareApplied(this.koa, bodyParser)) {
            this.koa.use(bodyParser());
        }
    }
    isMiddlewareApplied(app, ctor) {
        return (!!app.middleware &&
            !!app.middleware.filter(layer => layer instanceof ctor).length);
    }
    async setupRouter() {
        const router = koa_adapter_1.KoaAdapter.createRouter();
        await this.setupMiddlewares(router);
        const useErrorHandler = this.appOptions && this.appOptions.errorHandler !== false;
        useErrorHandler && this.routesResolver.setupErrorHandler(this.koa);
        this.routesResolver.resolve(router, this.koa);
        // this.koa.use(validatePath(this.config.getGlobalPrefix()), router);
        router.prefix(shared_utils_1.validatePath(this.config.getGlobalPrefix()));
    }
    connectMicroservice(config) {
        if (!NeskMicroservice) {
            throw new microservices_package_not_found_exception_1.MicroservicesPackageNotFoundException();
        }
        const applicationConfig = new application_config_1.ApplicationConfig();
        const instance = new NeskMicroservice(this.container, config, applicationConfig);
        instance.setupListeners();
        instance.setIsInitialized(true);
        instance.setIsInitHookCalled(true);
        this.microservices.push(instance);
        return instance;
    }
    getMicroservices() {
        return this.microservices;
    }
    getHttpServer() {
        return this.httpServer;
    }
    startAllMicroservices(callback) {
        Promise.all(this.microservices.map(this.listenToPromise)).then(() => callback && callback());
        return this;
    }
    startAllMicroservicesAsync() {
        return new Promise(resolve => this.startAllMicroservices(resolve));
    }
    use(...args) {
        this.koa.use(...args);
        return this;
    }
    engine(...args) {
        this.koa.use(views(...args));
        return this;
    }
    enableCors(options) {
        this.koa.use(cors(options));
        return this;
    }
    async listen(port, ...args) {
        !this.isInitialized && (await this.init());
        this.httpServer.listen(port, ...args);
        return this.httpServer;
    }
    listenAsync(port, hostname) {
        return new Promise(resolve => {
            const server = this.listen(port, hostname, () => resolve(server));
        });
    }
    close() {
        this.socketModule && this.socketModule.close();
        this.httpServer && this.httpServer.close();
        this.microservices.forEach(microservice => {
            microservice.setIsTerminated(true);
            microservice.close();
        });
        this.callDestroyHook();
    }
    setGlobalPrefix(prefix) {
        this.config.setGlobalPrefix(prefix);
        return this;
    }
    useWebSocketAdapter(adapter) {
        this.config.setIoAdapter(adapter);
        return this;
    }
    useGlobalFilters(...filters) {
        this.config.useGlobalFilters(...filters);
        return this;
    }
    useGlobalPipes(...pipes) {
        this.config.useGlobalPipes(...pipes);
        return this;
    }
    useGlobalInterceptors(...interceptors) {
        this.config.useGlobalInterceptors(...interceptors);
        return this;
    }
    useGlobalGuards(...guards) {
        this.config.useGlobalGuards(...guards);
        return this;
    }
    async setupMiddlewares(instance) {
        await this.middlewaresModule.setupMiddlewares(this.middlewaresContainer, instance);
    }
    listenToPromise(microservice) {
        return new Promise(async (resolve, reject) => {
            await microservice.listen(resolve);
        });
    }
    callInitHook() {
        const modules = this.container.getModules();
        modules.forEach(module => {
            this.callModuleInitHook(module);
        });
    }
    callModuleInitHook(module) {
        const components = [...module.routes, ...module.components];
        iterare_1.default(components)
            .map(([key, { instance }]) => instance)
            .filter(instance => !shared_utils_1.isNil(instance))
            .filter(this.hasOnModuleInitHook)
            .forEach(instance => instance.onModuleInit());
    }
    hasOnModuleInitHook(instance) {
        return !shared_utils_1.isUndefined(instance.onModuleInit);
    }
    callDestroyHook() {
        const modules = this.container.getModules();
        modules.forEach(module => {
            this.callModuleDestroyHook(module);
        });
    }
    callModuleDestroyHook(module) {
        const components = [...module.routes, ...module.components];
        iterare_1.default(components)
            .map(([key, { instance }]) => instance)
            .filter(instance => !shared_utils_1.isNil(instance))
            .filter(this.hasOnModuleDestroyHook)
            .forEach(instance => instance.onModuleDestroy());
    }
    hasOnModuleDestroyHook(instance) {
        return !shared_utils_1.isUndefined(instance.onModuleDestroy);
    }
}
exports.NeskApplication = NeskApplication;
