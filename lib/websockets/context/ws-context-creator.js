"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@neskjs/common/constants");
const constants_2 = require("@neskjs/core/guards/constants");
const ws_exception_1 = require("../exceptions/ws-exception");
class WsContextCreator {
    constructor(wsProxy, exceptionFiltersContext, pipesCreator, pipesConsumer, guardsContextCreator, guardsConsumer, interceptorsContextCreator, interceptorsConsumer) {
        this.wsProxy = wsProxy;
        this.exceptionFiltersContext = exceptionFiltersContext;
        this.pipesCreator = pipesCreator;
        this.pipesConsumer = pipesConsumer;
        this.guardsContextCreator = guardsContextCreator;
        this.guardsConsumer = guardsConsumer;
        this.interceptorsContextCreator = interceptorsContextCreator;
        this.interceptorsConsumer = interceptorsConsumer;
    }
    create(instance, callback, module) {
        const exceptionHandler = this.exceptionFiltersContext.create(instance, callback);
        const pipes = this.pipesCreator.create(instance, callback);
        const guards = this.guardsContextCreator.create(instance, callback, module);
        const metatype = this.getDataMetatype(instance, callback);
        const interceptors = this.interceptorsContextCreator.create(instance, callback, module);
        return this.wsProxy.create(async (client, data) => {
            const canActivate = await this.guardsConsumer.tryActivate(guards, data, instance, callback);
            if (!canActivate) {
                throw new ws_exception_1.WsException(constants_2.FORBIDDEN_MESSAGE);
            }
            const handler = async () => {
                const result = await this.pipesConsumer.applyPipes(data, { metatype }, pipes);
                return callback.call(instance, client, result);
            };
            return await this.interceptorsConsumer.intercept(interceptors, data, instance, callback, handler);
        }, exceptionHandler);
    }
    reflectCallbackParamtypes(instance, callback) {
        return Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, callback.name);
    }
    getDataMetatype(instance, callback) {
        const paramtypes = this.reflectCallbackParamtypes(instance, callback);
        return paramtypes && paramtypes.length ? paramtypes[1] : null;
    }
}
exports.WsContextCreator = WsContextCreator;
