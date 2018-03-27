import { ExceptionsHandler } from '../exceptions/exceptions-handler';
import { RouterExtensionContext } from './router-extension-context';

export type RouterProxyCallback = (ctx?, next?) => void;

export class RouterProxy {
  constructor(
    private readonly routerExtensionContext: RouterExtensionContext,
  ) {}

  public createProxy(
    targetCallback: RouterProxyCallback,
    exceptionsHandler: ExceptionsHandler,
  ) {
    return async (ctx, next) => {
      ctx = this.routerExtensionContext.create(ctx);
      try {
        await targetCallback(ctx, next);
      } catch (e) {
        exceptionsHandler.next(e, ctx);
      }
    };
  }

  public createExceptionLayerProxy(
    exceptionsHandler: (ctx) => void,
  ) {
    return async (ctx, next) => {
      ctx = this.routerExtensionContext.create(ctx);
      await next();
      exceptionsHandler(ctx);
    };
  }
}
