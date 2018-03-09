import * as koa from 'koa';

export class KoaAdapter {
  public static create(): any {
    return new koa();
  }

  // public static createRouter(): any {
  //   return express.Router({ mergeParams: true });
  // }
}
