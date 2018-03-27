import iterate from 'iterare';
import { GUARDS_METADATA } from '@neskjs/common/constants';
import {
  isUndefined,
  isFunction,
  isNil,
  isEmpty,
} from '@neskjs/common/utils/shared.utils';
import { Controller } from '@neskjs/common/interfaces';
import { HttpStatus, ExecutionContext, NeskInterceptor } from '@neskjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/switchMap';

export class InterceptorsConsumer {
  public async intercept(
    interceptors: NeskInterceptor[],
    data: any,
    instance: Controller,
    callback: (...args) => any,
    next: () => Promise<any>,
  ): Promise<any> {
    if (!interceptors || isEmpty(interceptors)) {
      return await (await next());
    }
    const context = this.createContext(instance, callback);
    const start$ = Observable.defer(() => this.transformDeffered(next));
    const result$ = await interceptors.reduce(
      async (stream$, interceptor) =>
        await interceptor.intercept(data, context, await stream$),
      Promise.resolve(start$),
    );
    return await result$.toPromise();
  }

  public createContext(
    instance: Controller,
    callback: (...args) => any,
  ): ExecutionContext {
    return {
      parent: instance.constructor,
      handler: callback,
    };
  }

  public transformDeffered(next: () => Promise<any>): Observable<any> {
    return Observable.fromPromise(next())
      .switchMap((res) => {
        const isDeffered = res instanceof Promise || res instanceof Observable;
        return isDeffered ? res : Promise.resolve(res);
      });
  }
}
