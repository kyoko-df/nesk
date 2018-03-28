import { ExceptionFilterMetadata } from '@neskjs/common/interfaces/exceptions/exception-filter-metadata.interface';
import { HttpException } from '@neskjs/common';
export declare class ExceptionsHandler {
    private static readonly logger;
    private filters;
    next(exception: Error | HttpException | any, ctx: any): void;
    setCustomFilters(filters: ExceptionFilterMetadata[]): void;
    invokeCustomFilters(exception: any, ctx: any): boolean;
}
