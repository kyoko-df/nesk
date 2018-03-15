import { ExceptionsHandler } from '../exceptions/exceptions-handler';

export type RouterProxyCallback = (ctx?, next?) => void;

export class RouterProxy {
  public createProxy(
    targetCallback: RouterProxyCallback,
    exceptionsHandler: ExceptionsHandler,
  ) {
    return async(ctx, next) => {
      try {
        await targetCallback(ctx, next);
        // Promise.resolve(targetCallback(ctx, next)).catch(e => {
        //   exceptionsHandler.next(e, ctx.response);
        // });
      } catch (e) {
        exceptionsHandler.next(e, ctx);
      }
    };
  }

  public createExceptionLayerProxy(
    targetCallback: (err, ctx, next) => void,
    exceptionsHandler: ExceptionsHandler,
  ) {
    return async(err, ctx, next) => {
      try {
        await targetCallback(err, ctx, next);
        // Promise.resolve(targetCallback(err, ctx, next)).catch(e => {
        //   exceptionsHandler.next(e, ctx.response);
        // });
      } catch (e) {
        exceptionsHandler.next(e, ctx);
      }
    };
  }
}
