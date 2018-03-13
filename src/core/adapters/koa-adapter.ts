import * as Koa from 'koa';
import * as Router from 'koa-router';

export class KoaAdapter {
  public static create(): any {
    return new Koa();
  }
}
