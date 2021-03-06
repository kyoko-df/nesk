import 'reflect-metadata';
import iterate from 'iterare';
import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { ExceptionsHandler } from '../exceptions/exceptions-handler';
import {
  EXCEPTION_FILTERS_METADATA,
  FILTER_CATCH_EXCEPTIONS,
} from '@neskjs/common/constants';
import {
  isEmpty,
  isFunction,
  isUndefined,
} from '@neskjs/common/utils/shared.utils';
import { Metatype } from '@neskjs/common/interfaces/index';
import { ExceptionFilterMetadata } from '@neskjs/common/interfaces/exceptions/exception-filter-metadata.interface';
import { UnknownModuleException } from '../errors/exceptions/unknown-module.exception';
import { ExceptionFilter } from '@neskjs/common/interfaces/exceptions/exception-filter.interface';
import { RouterProxyCallback } from './../router/router-proxy';
import { ContextCreator } from './../helpers/context-creator';
import { ApplicationConfig } from './../application-config';

export class BaseExceptionFilterContext extends ContextCreator {
  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    if (isUndefined(metadata) || isEmpty(metadata)) {
      return [] as R;
    }
    return iterate(metadata)
      .filter(instance => instance.catch && isFunction(instance.catch))
      .map(instance => ({
        func: instance.catch.bind(instance),
        exceptionMetatypes: this.reflectCatchExceptions(instance),
      }))
      .toArray() as R;
  }

  public reflectCatchExceptions(instance: ExceptionFilter): Metatype<any>[] {
    const prototype = Object.getPrototypeOf(instance);
    return (
      Reflect.getMetadata(FILTER_CATCH_EXCEPTIONS, prototype.constructor) || []
    );
  }
}
