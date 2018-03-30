"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@neskjs/common");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
require("rxjs/add/operator/toPromise");
class RouterResponseController {
    async apply(resultOrDeffered, response, httpStatusCode) {
        const result = await this.transformToResult(resultOrDeffered);
        response.status = httpStatusCode;
        if (shared_utils_1.isNil(result)) {
            return response.send();
        }
        return shared_utils_1.isObject(result) ? response.json(result) : response.send(String(result));
    }
    async render(resultOrDeffered, ctx, template) {
        const result = await this.transformToResult(resultOrDeffered);
        ctx.render(template, result);
    }
    async transformToResult(resultOrDeffered) {
        if (resultOrDeffered instanceof Promise) {
            return await resultOrDeffered;
        }
        else if (resultOrDeffered && shared_utils_1.isFunction(resultOrDeffered.subscribe)) {
            return await resultOrDeffered.toPromise();
        }
        return resultOrDeffered;
    }
    getStatusByMethod(requestMethod) {
        switch (requestMethod) {
            case common_1.RequestMethod.POST:
                return common_1.HttpStatus.CREATED;
            default:
                return common_1.HttpStatus.OK;
        }
    }
}
exports.RouterResponseController = RouterResponseController;
