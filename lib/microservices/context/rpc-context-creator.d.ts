import { Observable } from 'rxjs/Observable';
import { RpcProxy } from './rpc-proxy';
import { ExceptionFiltersContext } from './exception-filters-context';
import { Controller } from '@neskjs/common/interfaces';
import { PipesContextCreator } from '@neskjs/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@neskjs/core/pipes/pipes-consumer';
import { GuardsContextCreator } from '@neskjs/core/guards/guards-context-creator';
import { GuardsConsumer } from '@neskjs/core/guards/guards-consumer';
import { InterceptorsContextCreator } from '@neskjs/core/interceptors/interceptors-context-creator';
import { InterceptorsConsumer } from '@neskjs/core/interceptors/interceptors-consumer';
export declare class RpcContextCreator {
    private readonly rpcProxy;
    private readonly exceptionFiltersContext;
    private readonly pipesCreator;
    private readonly pipesConsumer;
    private readonly guardsContextCreator;
    private readonly guardsConsumer;
    private readonly interceptorsContextCreator;
    private readonly interceptorsConsumer;
    constructor(rpcProxy: RpcProxy, exceptionFiltersContext: ExceptionFiltersContext, pipesCreator: PipesContextCreator, pipesConsumer: PipesConsumer, guardsContextCreator: GuardsContextCreator, guardsConsumer: GuardsConsumer, interceptorsContextCreator: InterceptorsContextCreator, interceptorsConsumer: InterceptorsConsumer);
    create(instance: Controller, callback: (data) => Observable<any>, module: any): (data) => Promise<Observable<any>>;
    reflectCallbackParamtypes(instance: Controller, callback: (...args) => any): any[];
    getDataMetatype(instance: any, callback: any): any;
}
