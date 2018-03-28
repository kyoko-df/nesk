import { RouteParamtypes } from '@neskjs/common/enums/route-paramtypes.enum';
import { IRouteParamsFactory } from './interfaces/route-params-factory.interface';
export declare class RouteParamsFactory implements IRouteParamsFactory {
    exchangeKeyForValue(key: RouteParamtypes | string, data: any, {ctx, next}: {
        ctx: any;
        next: any;
    }): any;
}
