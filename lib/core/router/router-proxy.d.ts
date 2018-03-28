import { ExceptionsHandler } from '../exceptions/exceptions-handler';
import { RouterExtensionContext } from './router-extension-context';
export declare type RouterProxyCallback = (ctx?, next?) => void;
export declare class RouterProxy {
    private readonly routerExtensionContext;
    constructor(routerExtensionContext: RouterExtensionContext);
    createProxy(targetCallback: RouterProxyCallback, exceptionsHandler: ExceptionsHandler): (ctx: any, next: any) => Promise<void>;
    createExceptionLayerProxy(exceptionsHandler: (ctx) => void): (ctx: any, next: any) => Promise<void>;
}
