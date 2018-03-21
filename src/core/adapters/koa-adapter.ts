import * as Koa from 'koa';
import * as Router from 'koa-router';
import { reponseExtension } from './response-extension';
// import * as views from 'koa-views';

class KoaWrapper extends Koa {
  constructor() {
    super()
  }

  createContext(req, res) {
    const context = super.createContext(req, res);
    reponseExtension(context.response);
    return context;
  }
}

export class KoaAdapter {
  public static create(): any {
    return new KoaWrapper();
    // return new Koa();
  }

  public static createRouter(): any {
    return new Router();
  }
}
