"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
class KoaAdapter {
    static create() {
        return new Koa();
    }
    static createRouter() {
        return new Router();
    }
}
exports.KoaAdapter = KoaAdapter;
