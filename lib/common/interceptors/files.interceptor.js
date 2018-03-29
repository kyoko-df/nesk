"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("koa-multer");
const multer_utils_1 = require("./multer/multer.utils");
function FilesInterceptor(fieldName, maxCount, options) {
    const Interceptor = class {
        constructor() {
            this.upload = multer(options);
        }
        async intercept(koaCtx, context, stream$) {
            await new Promise((resolve, reject) => this.upload.array(fieldName, maxCount)(koaCtx.req, koaCtx.res, err => {
                if (err) {
                    const error = multer_utils_1.transformException(err);
                    return reject(error);
                }
                resolve();
            }));
            return stream$;
        }
    };
    return Interceptor;
}
exports.FilesInterceptor = FilesInterceptor;
