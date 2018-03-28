"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_exception_1 = require("./http-exception");
const constants_1 = require("../constants");
const common_1 = require("@neskjs/common");
const shared_utils_1 = require("@neskjs/common/utils/shared.utils");
const invalid_exception_filter_exception_1 = require("../errors/exceptions/invalid-exception-filter.exception");
const common_2 = require("@neskjs/common");
const ERROR_EVENT = 'error';
class ExceptionsHandler {
    constructor() {
        this.filters = [];
    }
    next(exception, ctx) {
        const { response } = ctx;
        if (this.invokeCustomFilters(exception, ctx))
            return;
        if (!(exception instanceof common_2.HttpException ||
            exception instanceof http_exception_1.HttpException)) {
            response.status = 500;
            response.json({
                statusCode: 500,
                message: constants_1.messages.UNKNOWN_EXCEPTION_MESSAGE,
            });
            ctx.app.emit(ERROR_EVENT, exception, ctx);
            if (shared_utils_1.isObject(exception) && exception.message) {
                return ExceptionsHandler.logger.error(exception.message, exception.stack);
            }
            return ExceptionsHandler.logger.error(exception);
        }
        const res = exception.getResponse();
        const message = shared_utils_1.isObject(res)
            ? res
            : {
                statusCode: exception.getStatus(),
                message: res,
            };
        response.status = exception.getStatus();
        response.json(message);
        ctx.app.emit(ERROR_EVENT, exception, ctx);
    }
    setCustomFilters(filters) {
        if (!Array.isArray(filters)) {
            throw new invalid_exception_filter_exception_1.InvalidExceptionFilterException();
        }
        this.filters = filters;
    }
    invokeCustomFilters(exception, ctx) {
        if (shared_utils_1.isEmpty(this.filters))
            return false;
        const filter = this.filters.find(({ exceptionMetatypes, func }) => {
            const hasMetatype = !exceptionMetatypes.length ||
                !!exceptionMetatypes.find(ExceptionMetatype => exception instanceof ExceptionMetatype);
            return hasMetatype;
        });
        filter && filter.func(exception, ctx);
        return !!filter;
    }
}
ExceptionsHandler.logger = new common_1.Logger(ExceptionsHandler.name);
exports.ExceptionsHandler = ExceptionsHandler;
