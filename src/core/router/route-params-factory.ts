import { RouteParamtypes } from '@neskjs/common/enums/route-paramtypes.enum';
import { IRouteParamsFactory } from './interfaces/route-params-factory.interface';

export class RouteParamsFactory implements IRouteParamsFactory {
  public exchangeKeyForValue(
    key: RouteParamtypes | string,
    data,
    { ctx, next },
  ) {
    switch (key) {
      case RouteParamtypes.CTX:
        return ctx;
      case RouteParamtypes.REQUEST:
        return ctx.request;
      case RouteParamtypes.RESPONSE:
        return ctx.response;
      case RouteParamtypes.NEXT:
        return next;
      case RouteParamtypes.BODY:
        return data ? ctx.request.body[data] : ctx.request.body;
      case RouteParamtypes.PARAM:
        return data ? ctx.params[data] : ctx.params;
      case RouteParamtypes.QUERY:
        return data ? ctx.query[data] : ctx.query;
      case RouteParamtypes.HEADERS:
        return data ? ctx.headers[data] : ctx.headers;
      case RouteParamtypes.SESSION:
        return ctx.session;
      case RouteParamtypes.FILE:
        return ctx.file;
      case RouteParamtypes.FILES:
        return ctx.files;
      default:
        return null;
    }
  }
}
