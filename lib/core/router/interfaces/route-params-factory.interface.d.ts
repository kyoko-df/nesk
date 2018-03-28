import { RouteParamtypes } from '@neskjs/common/enums/route-paramtypes.enum';
export interface IRouteParamsFactory {
    exchangeKeyForValue(key: RouteParamtypes | string, data: any, {ctx, next}: {
        ctx: any;
        next: any;
    }): any;
}
