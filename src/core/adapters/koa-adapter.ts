import * as Koa from 'koa';
import * as Router from 'koa-router';
import { BaseExtension } from './base-extension';

class KoaWrapper extends Koa {
  constructor(private readonly extention: BaseExtension) {
    super()
  }

  createContext(req, res) {
    const context = super.createContext(req, res);
    this.extention.response(context.response);
    return context;
  }
}

export class KoaAdapter {
  public static create(): any {
    return new KoaWrapper(new BaseExtension());
  }

  public static createRouter(): any {
    return new Router();
  }
}
