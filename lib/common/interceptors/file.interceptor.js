"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const component_decorator_1 = require("../decorators/core/component.decorator");
const multer_utils_1 = require("./multer/multer.utils");
function FileInterceptor(fieldName, options) {
    return component_decorator_1.mixin(class {
        constructor() {
            this.upload = multer(options);
        }
        async intercept(request, context, stream$) {
            await new Promise((resolve, reject) => this.upload.single(fieldName)(request, request.res, err => {
                if (err) {
                    const error = multer_utils_1.transformException(err);
                    return reject(error);
                }
                resolve();
            }));
            return stream$;
        }
    });
}
exports.FileInterceptor = FileInterceptor;
