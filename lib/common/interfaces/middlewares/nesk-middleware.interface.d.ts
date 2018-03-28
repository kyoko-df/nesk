import { KoaMiddleware } from './koa-middleware.interface';
export interface NeskMiddleware {
    resolve(...args: any[]): KoaMiddleware;
}
