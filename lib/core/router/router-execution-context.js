"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("@neskjs/common/constants");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const route_paramtypes_enum_1 = require("@neskjs/common/enums/route-paramtypes.enum");
const common_1 = require("@neskjs/common");
const constants_2 = require("../guards/constants");
const router_response_controller_1 = require("./router-response-controller");
class RouterExecutionContext {
    constructor(paramsFactory, pipesContextCreator, pipesConsumer, guardsContextCreator, guardsConsumer, interceptorsContextCreator, interceptorsConsumer) {
        this.paramsFactory = paramsFactory;
        this.pipesContextCreator = pipesContextCreator;
        this.pipesConsumer = pipesConsumer;
        this.guardsContextCreator = guardsContextCreator;
        this.guardsConsumer = guardsConsumer;
        this.interceptorsContextCreator = interceptorsContextCreator;
        this.interceptorsConsumer = interceptorsConsumer;
        this.responseController = new router_response_controller_1.RouterResponseController();
    }
    create(instance, callback, methodName, module, requestMethod) {
        const metadata = this.reflectCallbackMetadata(instance, methodName) || {};
        const keys = Object.keys(metadata);
        const argsLength = this.getArgumentsLength(keys, metadata);
        const pipes = this.pipesContextCreator.create(instance, callback);
        const paramtypes = this.reflectCallbackParamtypes(instance, methodName);
        const guards = this.guardsContextCreator.create(instance, callback, module);
        const interceptors = this.interceptorsContextCreator.create(instance, callback, module);
        const httpCode = this.reflectHttpStatusCode(callback);
        const paramsMetadata = this.exchangeKeysForValues(keys, metadata);
        const isResponseHandled = paramsMetadata.some(({ type }) => type === route_paramtypes_enum_1.RouteParamtypes.RESPONSE || type === route_paramtypes_enum_1.RouteParamtypes.NEXT);
        const paramsOptions = this.mergeParamsMetatypes(paramsMetadata, paramtypes);
        const httpStatusCode = httpCode
            ? httpCode
            : this.responseController.getStatusByMethod(requestMethod);
        const fnCanActivate = this.createGuardsFn(guards, instance, callback);
        const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);
        const fnHandleResponse = this.createHandleResponseFn(callback, isResponseHandled, httpStatusCode);
        return async (ctx, next) => {
            const args = this.createNullArray(argsLength);
            fnCanActivate && (await fnCanActivate(ctx));
            const handler = async () => {
                fnApplyPipes && (await fnApplyPipes(args, ctx, next));
                return callback.apply(instance, args);
            };
            const result = await this.interceptorsConsumer.intercept(interceptors, ctx, instance, callback, handler);
            await fnHandleResponse(result, ctx);
        };
    }
    mapParamType(key) {
        const keyPair = key.split(':');
        return keyPair[0];
    }
    reflectCallbackMetadata(instance, methodName) {
        return Reflect.getMetadata(constants_1.ROUTE_ARGS_METADATA, instance, methodName);
    }
    reflectCallbackParamtypes(instance, methodName) {
        return Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, methodName);
    }
    reflectHttpStatusCode(callback) {
        return Reflect.getMetadata(constants_1.HTTP_CODE_METADATA, callback);
    }
    reflectRenderTemplate(callback) {
        return Reflect.getMetadata(constants_1.RENDER_METADATA, callback);
    }
    getArgumentsLength(keys, metadata) {
        return Math.max(...keys.map(key => metadata[key].index)) + 1;
    }
    createNullArray(length) {
        return Array.apply(null, { length }).fill(null);
    }
    exchangeKeysForValues(keys, metadata) {
        return keys.map(key => {
            const { index, data, pipes } = metadata[key];
            const type = this.mapParamType(key);
            if (key.includes(constants_1.CUSTOM_ROUTE_AGRS_METADATA)) {
                const { factory } = metadata[key];
                const customExtractValue = this.getCustomFactory(factory, data);
                return { index, extractValue: customExtractValue, type, data, pipes };
            }
            const nType = Number(type);
            const extractValue = (ctx, next) => this.paramsFactory.exchangeKeyForValue(nType, data, { ctx, next });
            return { index, extractValue, type: nType, data, pipes };
        });
    }
    getCustomFactory(factory, data) {
        return !shared_utils_1.isUndefined(factory) && shared_utils_1.isFunction(factory)
            ? (ctx, next) => factory(data, ctx.request)
            : () => null;
    }
    mergeParamsMetatypes(paramsProperties, paramtypes) {
        if (!paramtypes) {
            return paramsProperties;
        }
        return paramsProperties.map(param => (Object.assign({}, param, { metatype: paramtypes[param.index] })));
    }
    async getParamValue(value, { metatype, type, data }, transforms) {
        if (type === route_paramtypes_enum_1.RouteParamtypes.BODY ||
            type === route_paramtypes_enum_1.RouteParamtypes.QUERY ||
            type === route_paramtypes_enum_1.RouteParamtypes.PARAM ||
            shared_utils_1.isString(type)) {
            return await this.pipesConsumer.apply(value, { metatype, type, data }, transforms);
        }
        return Promise.resolve(value);
    }
    createGuardsFn(guards, instance, callback) {
        const canActivateFn = async (context) => {
            const canActivate = await this.guardsConsumer.tryActivate(guards, context, instance, callback);
            if (!canActivate) {
                throw new common_1.HttpException(constants_2.FORBIDDEN_MESSAGE, common_1.HttpStatus.FORBIDDEN);
            }
        };
        return guards.length ? canActivateFn : null;
    }
    createPipesFn(pipes, paramsOptions) {
        const pipesFn = async (args, ctx, next) => {
            await Promise.all(paramsOptions.map(async (param) => {
                const { index, extractValue, type, data, metatype, pipes: paramPipes, } = param;
                const value = extractValue(ctx, next);
                args[index] = await this.getParamValue(value, { metatype, type, data }, pipes.concat(this.pipesContextCreator.createConcreteContext(paramPipes)));
            }));
        };
        return paramsOptions.length ? pipesFn : null;
    }
    createHandleResponseFn(callback, isResponseHandled, httpStatusCode) {
        const renderTemplate = this.reflectRenderTemplate(callback);
        if (!!renderTemplate) {
            return async (result, ctx) => await ctx.render(renderTemplate, result);
        }
        return async (result, ctx) => !isResponseHandled &&
            (await this.responseController.apply(result, ctx.response, httpStatusCode));
    }
}
exports.RouterExecutionContext = RouterExecutionContext;
