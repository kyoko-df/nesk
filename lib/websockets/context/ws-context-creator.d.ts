import { WsProxy } from './ws-proxy';
import { ExceptionFiltersContext } from './exception-filters-context';
import { Controller } from '@neskjs/common/interfaces';
import { PipesContextCreator } from '@neskjs/core/pipes/pipes-context-creator';
import { PipesConsumer } from '@neskjs/core/pipes/pipes-consumer';
import { GuardsContextCreator } from '@neskjs/core/guards/guards-context-creator';
import { GuardsConsumer } from '@neskjs/core/guards/guards-consumer';
import { InterceptorsConsumer } from '@neskjs/core/interceptors/interceptors-consumer';
import { InterceptorsContextCreator } from '@neskjs/core/interceptors/interceptors-context-creator';
export declare class WsContextCreator {
    private readonly wsProxy;
    private readonly exceptionFiltersContext;
    private readonly pipesCreator;
    private readonly pipesConsumer;
    private readonly guardsContextCreator;
    private readonly guardsConsumer;
    private readonly interceptorsContextCreator;
    private readonly interceptorsConsumer;
    constructor(wsProxy: WsProxy, exceptionFiltersContext: ExceptionFiltersContext, pipesCreator: PipesContextCreator, pipesConsumer: PipesConsumer, guardsContextCreator: GuardsContextCreator, guardsConsumer: GuardsConsumer, interceptorsContextCreator: InterceptorsContextCreator, interceptorsConsumer: InterceptorsConsumer);
    create(instance: Controller, callback: (client, data) => void, module: any): (client, data) => Promise<void>;
    reflectCallbackParamtypes(instance: Controller, callback: (...args) => any): any[];
    getDataMetatype(instance: any, callback: any): any;
}
