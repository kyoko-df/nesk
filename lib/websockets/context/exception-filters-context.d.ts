import 'reflect-metadata';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { BaseExceptionFilterContext } from '@neskjs/core/exceptions/base-exception-filter-context';
import { WsExceptionsHandler } from '../exceptions/ws-exceptions-handler';
export declare class ExceptionFiltersContext extends BaseExceptionFilterContext {
    create(instance: Controller, callback: (client, data) => any): WsExceptionsHandler;
    getGlobalMetadata<T extends any[]>(): T;
}
