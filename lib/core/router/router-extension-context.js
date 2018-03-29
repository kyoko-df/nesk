"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';
class RouterExtensionContext {
    create(context) {
        const { request, response } = context;
        this.createResponse(response);
        return context;
    }
    createResponse(response) {
        response.json = this.addJsonMethod(response);
        response.send = this.addSendMethod(response);
    }
    addJsonMethod(response) {
        return (obj) => {
            if (!obj) {
                return;
            }
            response.set(CONTENT_TYPE, APPLICATION_JSON);
            response.body = obj;
        };
    }
    addSendMethod(response) {
        return (body) => {
            if (!body) {
                return;
            }
            response.body = body;
        };
    }
}
exports.RouterExtensionContext = RouterExtensionContext;
