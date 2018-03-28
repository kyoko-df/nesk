"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const unknown_dependencies_exception_1 = require("../errors/exceptions/unknown-dependencies.exception");
const runtime_exception_1 = require("../errors/exceptions/runtime.exception");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const constants_1 = require("@neskjs/common/constants");
const undefined_dependency_exception_1 = require("./../errors/exceptions/undefined-dependency.exception");
class Injector {
    async loadInstanceOfMiddleware(wrapper, collection, module) {
        const { metatype } = wrapper;
        const currentMetatype = collection.get(metatype.name);
        if (currentMetatype.instance !== null)
            return;
        await this.resolveConstructorParams(wrapper, module, null, null, instances => {
            collection.set(metatype.name, {
                instance: new metatype(...instances),
                metatype,
            });
        });
    }
    async loadInstanceOfRoute(wrapper, module) {
        const routes = module.routes;
        await this.loadInstance(wrapper, routes, module);
    }
    async loadInstanceOfInjectable(wrapper, module) {
        const injectables = module.injectables;
        await this.loadInstance(wrapper, injectables, module);
    }
    loadPrototypeOfInstance({ metatype, name }, collection) {
        if (!collection)
            return null;
        const target = collection.get(name);
        if (target.isResolved || !shared_utils_1.isNil(target.inject))
            return null;
        collection.set(name, Object.assign({}, collection.get(name), { instance: Object.create(metatype.prototype) }));
    }
    async loadInstanceOfComponent(wrapper, module, context = []) {
        const components = module.components;
        await this.loadInstance(wrapper, components, module, context);
    }
    applyDoneSubject(wrapper) {
        let done;
        wrapper.done$ = new Promise((resolve, reject) => {
            done = resolve;
        });
        wrapper.isPending = true;
        return done;
    }
    async loadInstance(wrapper, collection, module, context = []) {
        if (wrapper.isPending) {
            return await wrapper.done$;
        }
        const done = this.applyDoneSubject(wrapper);
        const { metatype, name, inject } = wrapper;
        const currentMetatype = collection.get(name);
        if (shared_utils_1.isUndefined(currentMetatype)) {
            throw new runtime_exception_1.RuntimeException();
        }
        if (currentMetatype.isResolved)
            return null;
        await this.resolveConstructorParams(wrapper, module, inject, context, async (instances) => {
            if (shared_utils_1.isNil(inject)) {
                currentMetatype.instance = Object.assign(currentMetatype.instance, new metatype(...instances));
            }
            else {
                const factoryResult = currentMetatype.metatype(...instances);
                currentMetatype.instance = await this.resolveFactoryInstance(factoryResult);
            }
            currentMetatype.isResolved = true;
            done();
        });
    }
    async resolveConstructorParams(wrapper, module, inject, context, callback) {
        let isResolved = true;
        const args = shared_utils_1.isNil(inject)
            ? this.reflectConstructorParams(wrapper.metatype)
            : inject;
        const instances = await Promise.all(args.map(async (param, index) => {
            const paramWrapper = await this.resolveSingleParam(wrapper, param, { index, length: args.length }, module, context);
            if (!paramWrapper.isResolved && !paramWrapper.forwardRef) {
                isResolved = false;
            }
            return paramWrapper.instance;
        }));
        isResolved && (await callback(instances));
    }
    reflectConstructorParams(type) {
        const paramtypes = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, type) || [];
        const selfParams = this.reflectSelfParams(type);
        selfParams.forEach(({ index, param }) => (paramtypes[index] = param));
        return paramtypes;
    }
    reflectSelfParams(type) {
        return Reflect.getMetadata(constants_1.SELF_DECLARED_DEPS_METADATA, type) || [];
    }
    async resolveSingleParam(wrapper, param, { index, length }, module, context) {
        if (shared_utils_1.isUndefined(param)) {
            throw new undefined_dependency_exception_1.UndefinedDependencyException(wrapper.name, index, length);
        }
        const token = this.resolveParamToken(wrapper, param);
        return await this.resolveComponentInstance(module, shared_utils_1.isFunction(token) ? token.name : token, { index, length }, wrapper, context);
    }
    resolveParamToken(wrapper, param) {
        if (!param.forwardRef) {
            return param;
        }
        wrapper.forwardRef = true;
        return param.forwardRef();
    }
    async resolveComponentInstance(module, name, { index, length }, wrapper, context) {
        const components = module.components;
        const instanceWrapper = await this.scanForComponent(components, module, { name, index, length }, wrapper, context);
        if (!instanceWrapper.isResolved && !instanceWrapper.forwardRef) {
            await this.loadInstanceOfComponent(instanceWrapper, module);
        }
        if (instanceWrapper.async) {
            instanceWrapper.instance = await instanceWrapper.instance;
        }
        return instanceWrapper;
    }
    async scanForComponent(components, module, { name, index, length }, { metatype }, context = []) {
        const component = await this.scanForComponentInScopes(context, { name, index, length }, metatype);
        if (component) {
            return component;
        }
        const scanInExports = () => this.scanForComponentInExports(components, { name, index, length }, module, metatype, context);
        return components.has(name) ? components.get(name) : await scanInExports();
    }
    async scanForComponentInExports(components, { name, index, length }, module, metatype, context = []) {
        const instanceWrapper = await this.scanForComponentInRelatedModules(module, name, context);
        if (shared_utils_1.isNil(instanceWrapper)) {
            throw new unknown_dependencies_exception_1.UnknownDependenciesException(metatype.name, index, length);
        }
        return instanceWrapper;
    }
    async scanForComponentInScopes(context, { name, index, length }, metatype) {
        context = context || [];
        for (const ctx of context) {
            const component = await this.scanForComponentInScope(ctx, { name, index, length }, metatype);
            if (component)
                return component;
        }
        return null;
    }
    async scanForComponentInScope(context, { name, index, length }, metatype) {
        try {
            const component = await this.scanForComponent(context.components, context, { name, index, length }, { metatype }, null);
            if (!component.isResolved && !component.forwardRef) {
                await this.loadInstanceOfComponent(component, context);
            }
            return component;
        }
        catch (e) {
            if (e instanceof runtime_exception_1.RuntimeException) {
                return null;
            }
            throw e;
        }
    }
    async scanForComponentInRelatedModules(module, name, context) {
        let component = null;
        const relatedModules = module.relatedModules || [];
        for (const relatedModule of this.flatMap([...relatedModules.values()])) {
            const { components, exports } = relatedModule;
            const isInScope = context === null;
            if ((!exports.has(name) && !isInScope) || !components.has(name)) {
                continue;
            }
            component = components.get(name);
            if (!component.isResolved && !component.forwardRef) {
                const ctx = isInScope ? [module] : [].concat(context, module);
                await this.loadInstanceOfComponent(component, relatedModule, ctx);
                break;
            }
        }
        return component;
    }
    async resolveFactoryInstance(factoryResult) {
        if (!(factoryResult instanceof Promise)) {
            return factoryResult;
        }
        const result = await factoryResult;
        return result;
    }
    flatMap(modules) {
        return modules.concat.apply(modules, modules.map((module) => {
            const { relatedModules, exports } = module;
            return this.flatMap([...relatedModules.values()].filter(related => {
                const { metatype } = related;
                return exports.has(metatype.name);
            }));
        }));
    }
}
exports.Injector = Injector;
