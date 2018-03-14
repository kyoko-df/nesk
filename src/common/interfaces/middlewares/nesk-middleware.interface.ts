import { KoaMiddleware } from './koa-middleware.interface';

export interface NeskMiddleware {
  resolve(
    ...args
  ): KoaMiddleware
}
