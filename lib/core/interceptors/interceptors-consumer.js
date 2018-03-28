"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/toPromise");
require("rxjs/add/observable/defer");
require("rxjs/add/observable/fromPromise");
require("rxjs/add/operator/take");
require("rxjs/add/operator/switchMap");
class InterceptorsConsumer {
    async intercept(interceptors, data, instance, callback, next) {
        if (!interceptors || shared_utils_1.isEmpty(interceptors)) {
            return await (await next());
        }
        const context = this.createContext(instance, callback);
        const start$ = Observable_1.Observable.defer(() => this.transformDeffered(next));
        const result$ = await interceptors.reduce(async (stream$, interceptor) => await interceptor.intercept(data, context, await stream$), Promise.resolve(start$));
        return await result$.toPromise();
    }
    createContext(instance, callback) {
        return {
            parent: instance.constructor,
            handler: callback,
        };
    }
    transformDeffered(next) {
        return Observable_1.Observable.fromPromise(next())
            .switchMap((res) => {
            const isDeffered = res instanceof Promise || res instanceof Observable_1.Observable;
            return isDeffered ? res : Promise.resolve(res);
        });
    }
}
exports.InterceptorsConsumer = InterceptorsConsumer;
