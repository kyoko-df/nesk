"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const [METHOD_SET, METHOD_BODY, METHOD_JSON, METHOD_SEND] = [
    'set',
    'body',
    'json',
    'send',
];
class RouterExtensionContext {
    create(context) {
        let { response } = context;
        response = this.createProxy(response);
        return Object.assign({}, context, { response });
    }
    createProxy(response) {
        const proxy = this.createResponseProxy();
        return new Proxy(response, {
            get: proxy,
        });
    }
    createResponseProxy() {
        return (receiver, prop) => {
            if (prop === METHOD_JSON || prop === METHOD_BODY) {
                return (body) => {
                    if (shared_utils_1.isNil(body))
                        return null;
                    receiver[METHOD_BODY] = body;
                };
            }
            return receiver[prop];
        };
    }
}
exports.RouterExtensionContext = RouterExtensionContext;
