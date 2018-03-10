import * as koa from 'koa';

export class KoaAdapter {
  public static create(): any {
    return new koa();
  }

  public static createRouter(): any {
    return koa.Router({ mergeParams: true });
  }
}
