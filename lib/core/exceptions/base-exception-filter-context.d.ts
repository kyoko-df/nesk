import 'reflect-metadata';
import { Metatype } from '@neskjs/common/interfaces/index';
import { ExceptionFilter } from '@neskjs/common/interfaces/exceptions/exception-filter.interface';
import { ContextCreator } from './../helpers/context-creator';
export declare class BaseExceptionFilterContext extends ContextCreator {
    createConcreteContext<T extends any[], R extends any[]>(metadata: T): R;
    reflectCatchExceptions(instance: ExceptionFilter): Metatype<any>[];
}
