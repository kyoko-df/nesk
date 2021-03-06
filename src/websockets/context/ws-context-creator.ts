import { Observable } from 'rxjs/Observable';
import { WsProxy } from './ws-proxy';
import { WsExceptionsHandler } from '../exceptions/ws-exceptions-handler';
import { ExceptionFiltersContext } from './exception-filters-context';
import { Controller } from '@neskjs/common/interfaces';
import { PipesContextCreator } from '@neskjs/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@neskjs/core/pipes/pipes-consumer';
import { PARAMTYPES_METADATA } from '@neskjs/common/constants';
import { GuardsContextCreator } from '@neskjs/core/guards/guards-context-creator';
import { GuardsConsumer } from '@neskjs/core/guards/guards-consumer';
import { FORBIDDEN_MESSAGE } from '@neskjs/core/guards/constants';
import { WsException } from '../exceptions/ws-exception';
import { InterceptorsConsumer } from '@neskjs/core/interceptors/interceptors-consumer';
import { InterceptorsContextCreator } from '@neskjs/core/interceptors/interceptors-context-creator';

export class WsContextCreator {
  constructor(
    private readonly wsProxy: WsProxy,
    private readonly exceptionFiltersContext: ExceptionFiltersContext,
    private readonly pipesCreator: PipesContextCreator,
    private readonly pipesConsumer: PipesConsumer,
    private readonly guardsContextCreator: GuardsContextCreator,
    private readonly guardsConsumer: GuardsConsumer,
    private readonly interceptorsContextCreator: InterceptorsContextCreator,
    private readonly interceptorsConsumer: InterceptorsConsumer,
  ) {}

  public create(
    instance: Controller,
    callback: (client, data) => void,
    module,
  ): (client, data) => Promise<void> {
    const exceptionHandler = this.exceptionFiltersContext.create(
      instance,
      callback,
    );
    const pipes = this.pipesCreator.create(instance, callback);
    const guards = this.guardsContextCreator.create(instance, callback, module);
    const metatype = this.getDataMetatype(instance, callback);
    const interceptors = this.interceptorsContextCreator.create(
      instance,
      callback,
      module,
    );

    return this.wsProxy.create(async (client, data) => {
      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        data,
        instance,
        callback,
      );
      if (!canActivate) {
        throw new WsException(FORBIDDEN_MESSAGE);
      }
      const handler = async () => {
        const result = await this.pipesConsumer.applyPipes(
          data,
          { metatype },
          pipes,
        );
        return callback.call(instance, client, result);
      };
      return await this.interceptorsConsumer.intercept(
        interceptors,
        data,
        instance,
        callback,
        handler,
      );
    }, exceptionHandler);
  }

  public reflectCallbackParamtypes(
    instance: Controller,
    callback: (...args) => any,
  ): any[] {
    return Reflect.getMetadata(PARAMTYPES_METADATA, instance, callback.name);
  }

  public getDataMetatype(instance, callback) {
    const paramtypes = this.reflectCallbackParamtypes(instance, callback);
    return paramtypes && paramtypes.length ? paramtypes[1] : null;
  }
}
