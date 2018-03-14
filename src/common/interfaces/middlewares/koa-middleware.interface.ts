// tslint:disable-next-line:callable-types
export interface KoaMiddleware {
  async (ctx?, next?): Promise<void>;
}
