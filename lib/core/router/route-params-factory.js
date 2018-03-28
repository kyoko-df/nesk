"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_paramtypes_enum_1 = require("@neskjs/common/enums/route-paramtypes.enum");
class RouteParamsFactory {
    exchangeKeyForValue(key, data, { ctx, next }) {
        switch (key) {
            case route_paramtypes_enum_1.RouteParamtypes.CTX:
                return data ? ctx[data] : ctx;
            case route_paramtypes_enum_1.RouteParamtypes.REQUEST:
                return ctx.request;
            case route_paramtypes_enum_1.RouteParamtypes.RESPONSE:
                return ctx.response;
            case route_paramtypes_enum_1.RouteParamtypes.NEXT:
                return next;
            case route_paramtypes_enum_1.RouteParamtypes.BODY:
                return data ? ctx.request.body[data] : ctx.request.body;
            case route_paramtypes_enum_1.RouteParamtypes.PARAM:
                return data ? ctx.params[data] : ctx.params;
            case route_paramtypes_enum_1.RouteParamtypes.QUERY:
                return data ? ctx.query[data] : ctx.query;
            case route_paramtypes_enum_1.RouteParamtypes.HEADERS:
                return data ? ctx.headers[data] : ctx.headers;
            case route_paramtypes_enum_1.RouteParamtypes.SESSION:
                return ctx.session;
            case route_paramtypes_enum_1.RouteParamtypes.FILE:
                return ctx.file;
            case route_paramtypes_enum_1.RouteParamtypes.FILES:
                return ctx.files;
            default:
                return null;
        }
    }
}
exports.RouteParamsFactory = RouteParamsFactory;
