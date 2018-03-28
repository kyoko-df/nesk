"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injector_1 = require("../injector/injector");
class MiddlewaresResolver {
    constructor(middlewaresContainer) {
        this.middlewaresContainer = middlewaresContainer;
        this.instanceLoader = new injector_1.Injector();
    }
    async resolveInstances(module, moduleName) {
        const middlewares = this.middlewaresContainer.getMiddlewares(moduleName);
        await Promise.all([...middlewares.values()].map(async (wrapper) => await this.resolveMiddlewareInstance(wrapper, middlewares, module)));
    }
    async resolveMiddlewareInstance(wrapper, middlewares, module) {
        await this.instanceLoader.loadInstanceOfMiddleware(wrapper, middlewares, module);
    }
}
exports.MiddlewaresResolver = MiddlewaresResolver;
