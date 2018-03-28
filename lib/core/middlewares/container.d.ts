import { MiddlewareConfiguration } from '@neskjs/common/interfaces/middlewares/middleware-configuration.interface';
import { NeskMiddleware } from '@neskjs/common/interfaces/middlewares/nesk-middleware.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
export declare class MiddlewaresContainer {
    private readonly middlewares;
    private readonly configs;
    getMiddlewares(module: string): Map<string, MiddlewareWrapper>;
    getConfigs(): Map<string, Set<MiddlewareConfiguration>>;
    addConfig(configList: MiddlewareConfiguration[], module: string): void;
    private getCurrentMiddlewares(module);
    private getCurrentConfig(module);
}
export interface MiddlewareWrapper {
    instance: NeskMiddleware;
    metatype: Metatype<NeskMiddleware>;
}
