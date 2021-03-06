import 'reflect-metadata';
import iterate from 'iterare';
import { Controller, NeskInterceptor } from '@neskjs/common/interfaces';
import { INTERCEPTORS_METADATA } from '@neskjs/common/constants';
import {
  isUndefined,
  isFunction,
  isNil,
  isEmpty,
} from '@neskjs/common/utils/shared.utils';
import { ContextCreator } from './../helpers/context-creator';
import { NeskContainer } from '../injector/container';
import { ConfigurationProvider } from '@neskjs/common/interfaces/configuration-provider.interface';

export class InterceptorsContextCreator extends ContextCreator {
  private moduleContext: string;

  constructor(
    private readonly container: NeskContainer,
    private readonly config?: ConfigurationProvider,
  ) {
    super();
  }

  public create(
    instance: Controller,
    callback: (...args) => any,
    module: string,
  ): NeskInterceptor[] {
    this.moduleContext = module;
    return this.createContext(instance, callback, INTERCEPTORS_METADATA);
  }

  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    if (isUndefined(metadata) || isEmpty(metadata) || !this.moduleContext) {
      return [] as R;
    }
    const isGlobalMetadata = metadata === this.getGlobalMetadata();
    return isGlobalMetadata
      ? this.createGlobalMetadataContext<T, R>(metadata)
      : (iterate(metadata)
          .filter((metatype: any) => metatype && metatype.name)
          .map(metatype => this.getInstanceByMetatype(metatype))
          .filter((wrapper: any) => wrapper && wrapper.instance)
          .map(wrapper => wrapper.instance)
          .filter(
            (interceptor: NeskInterceptor) =>
              interceptor && isFunction(interceptor.intercept),
          )
          .toArray() as R);
  }

  public createGlobalMetadataContext<T extends any[], R extends any[]>(
    metadata: T,
  ): R {
    return iterate(metadata)
      .filter(
        interceptor =>
          interceptor &&
          interceptor.intercept &&
          isFunction(interceptor.intercept),
      )
      .toArray() as R;
  }

  public getInstanceByMetatype(metatype): { instance: any } | undefined {
    const collection = this.container.getModules();
    const module = collection.get(this.moduleContext);
    if (!module) {
      return undefined;
    }
    return module.injectables.get((metatype as any).name);
  }

  public getGlobalMetadata<T extends any[]>(): T {
    if (!this.config) {
      return [] as T;
    }
    return this.config.getGlobalInterceptors() as T;
  }
}
