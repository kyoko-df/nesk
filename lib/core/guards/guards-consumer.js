"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/toPromise");
class GuardsConsumer {
    async tryActivate(guards, data, instance, callback) {
        if (!guards || shared_utils_1.isEmpty(guards)) {
            return true;
        }
        const context = this.createContext(instance, callback);
        for (const guard of guards) {
            const result = guard.canActivate(data, context);
            if (await this.pickResult(result)) {
                continue;
            }
            return false;
        }
        return true;
    }
    createContext(instance, callback) {
        return {
            parent: instance.constructor,
            handler: callback,
        };
    }
    async pickResult(result) {
        if (result instanceof Observable_1.Observable) {
            return await result.toPromise();
        }
        if (result instanceof Promise) {
            return await result;
        }
        return result;
    }
}
exports.GuardsConsumer = GuardsConsumer;
