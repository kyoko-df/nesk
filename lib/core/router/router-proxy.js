"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RouterProxy {
    constructor(routerExtensionContext) {
        this.routerExtensionContext = routerExtensionContext;
    }
    createProxy(targetCallback, exceptionsHandler) {
        return async (ctx, next) => {
            ctx = this.routerExtensionContext.create(ctx);
            try {
                await targetCallback(ctx, next);
            }
            catch (e) {
                exceptionsHandler.next(e, ctx);
            }
        };
    }
    createExceptionLayerProxy(exceptionsHandler) {
        return async (ctx, next) => {
            ctx = this.routerExtensionContext.create(ctx);
            await next();
            exceptionsHandler(ctx);
        };
    }
}
exports.RouterProxy = RouterProxy;
