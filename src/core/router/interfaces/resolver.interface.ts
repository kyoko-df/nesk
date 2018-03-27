export interface Resolver {
  resolve(router, koa);
  setupErrorHandler(koa);
}
