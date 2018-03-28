"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const optional = require("optional");
const scanner_1 = require("./scanner");
const instance_loader_1 = require("./injector/instance-loader");
const container_1 = require("./injector/container");
const exceptions_zone_1 = require("./errors/exceptions-zone");
const logger_service_1 = require("@neskjs/common/services/logger.service");
const constants_1 = require("./constants");
const nesk_application_1 = require("./nesk-application");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const koa_adapter_1 = require("./adapters/koa-adapter");
const metadata_scanner_1 = require("./metadata-scanner");
const microservices_package_not_found_exception_1 = require("./errors/exceptions/microservices-package-not-found.exception");
const nesk_application_context_1 = require("./nesk-application-context");
const application_config_1 = require("./application-config");
const { NeskMicroservice } = optional('@neskjs/microservices/nesk-microservice') || {};
class NeskFactoryStatic {
    constructor() {
        this.logger = new logger_service_1.Logger('NeskFactory', true);
    }
    async create(module, koaOrOptions, options) {
        const isKoaInstance = koaOrOptions && koaOrOptions.listen;
        const [koaInstance, appOptions] = isKoaInstance
            ? [koaOrOptions, options]
            : [koa_adapter_1.KoaAdapter.create(), koaOrOptions];
        const applicationConfig = new application_config_1.ApplicationConfig();
        const container = new container_1.NeskContainer(applicationConfig);
        this.applyLogger(appOptions);
        await this.initialize(module, container, applicationConfig, koaInstance);
        return this.createNeskInstance(new nesk_application_1.NeskApplication(container, koaInstance, applicationConfig, appOptions));
    }
    /**
     * Creates an instance of the NeskMicroservice (returns Promise)
     *
     * @param  {} module Entry (root) application module class
     * @param  {NeskMicroserviceOptions} options Optional microservice configuration
     * @returns an `Promise` of the INeskMicroservice instance
     */
    async createMicroservice(module, options) {
        if (!NeskMicroservice) {
            throw new microservices_package_not_found_exception_1.MicroservicesPackageNotFoundException();
        }
        const applicationConfig = new application_config_1.ApplicationConfig();
        const container = new container_1.NeskContainer(applicationConfig);
        this.applyLogger(options);
        await this.initialize(module, container, applicationConfig);
        return this.createNeskInstance(new NeskMicroservice(container, options, applicationConfig));
    }
    /**
     * Creates an instance of the NeskApplicationContext (returns Promise)
     *
     * @param  {} module Entry (root) application module class
     * @param  {NeskApplicationContextOptions} options Optional Nesk application configuration
     * @returns an `Promise` of the INeskApplicationContext instance
     */
    async createApplicationContext(module, options) {
        const container = new container_1.NeskContainer();
        this.applyLogger(options);
        await this.initialize(module, container);
        const modules = container.getModules().values();
        const root = modules.next().value;
        return this.createNeskInstance(new nesk_application_context_1.NeskApplicationContext(container, [], root));
    }
    createNeskInstance(instance) {
        return this.createProxy(instance);
    }
    async initialize(module, container, config = new application_config_1.ApplicationConfig(), koa = null) {
        const instanceLoader = new instance_loader_1.InstanceLoader(container);
        const dependenciesScanner = new scanner_1.DependenciesScanner(container, new metadata_scanner_1.MetadataScanner(), config);
        container.setApplicationRef(koa);
        try {
            this.logger.log(constants_1.messages.APPLICATION_START);
            await exceptions_zone_1.ExceptionsZone.asyncRun(async () => {
                dependenciesScanner.scan(module);
                await instanceLoader.createInstancesOfDependencies();
                dependenciesScanner.applyApplicationProviders();
            });
        }
        catch (e) {
            process.abort();
        }
    }
    createProxy(target) {
        const proxy = this.createExceptionProxy();
        return new Proxy(target, {
            get: proxy,
            set: proxy,
        });
    }
    createExceptionProxy() {
        return (receiver, prop) => {
            if (!(prop in receiver))
                return;
            if (shared_utils_1.isFunction(receiver[prop])) {
                return (...args) => {
                    let result;
                    exceptions_zone_1.ExceptionsZone.run(() => {
                        result = receiver[prop](...args);
                    });
                    return result;
                };
            }
            return receiver[prop];
        };
    }
    applyLogger(options) {
        if (!options || !options.logger) {
            return;
        }
        logger_service_1.Logger.overrideLogger(options.logger);
    }
}
exports.NeskFactoryStatic = NeskFactoryStatic;
exports.NeskFactory = new NeskFactoryStatic();
