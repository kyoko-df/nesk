export interface Resolver {
    resolve(router: any, koa: any): any;
    setupErrorHandler(koa: any): any;
}
