import { KoaMiddleware } from './koa-middleware.interface';

export type AsyncExpressMiddleware = Promise<KoaMiddleware>;
export interface NestMiddleware {
  resolve(
    ...args
  ):
    | KoaMiddleware
    | AsyncExpressMiddleware
    | Promise<AsyncExpressMiddleware>;
}
