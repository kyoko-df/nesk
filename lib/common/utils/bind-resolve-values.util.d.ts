import { Constructor } from './merge-with-values.util';
import { NeskMiddleware } from '../interfaces/middlewares/nesk-middleware.interface';
export declare const BindResolveMiddlewareValues: <T extends Constructor<NeskMiddleware>>(data: any[]) => (Metatype: T) => any;
