import { KoaMiddleware } from './koa-middleware.interface';

export type AsyncKoaMiddleware = Promise<KoaMiddleware>;
export interface NeskMiddleware {
  resolve(
    ...args
  ):
    | KoaMiddleware
    | AsyncKoaMiddleware
    | Promise<AsyncKoaMiddleware>;
}
