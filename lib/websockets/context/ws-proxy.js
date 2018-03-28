"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WsProxy {
    create(targetCallback, exceptionsHandler) {
        return async (client, data) => {
            try {
                return await targetCallback(client, data);
            }
            catch (e) {
                exceptionsHandler.handle(e, client);
            }
        };
    }
}
exports.WsProxy = WsProxy;
