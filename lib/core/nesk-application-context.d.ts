import { NeskContainer } from './injector/container';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Metatype } from '@neskjs/common/interfaces';
import { INeskApplicationContext } from '@neskjs/common';
export declare class NeskApplicationContext implements INeskApplicationContext {
    protected readonly container: NeskContainer;
    private readonly scope;
    protected contextModule: any;
    private readonly moduleTokenFactory;
    constructor(container: NeskContainer, scope: NeskModuleMetatype[], contextModule: any);
    selectContextModule(): void;
    select<T>(module: Metatype<T>): INeskApplicationContext;
    get<T>(metatypeOrToken: Metatype<T> | string | symbol): T;
    private findInstanceByPrototypeOrToken<T>(metatypeOrToken);
}
