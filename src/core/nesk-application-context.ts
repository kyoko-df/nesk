import { ModuleTokenFactory } from './injector/module-token-factory';
import { NeskContainer, InstanceWrapper } from './injector/container';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Metatype } from '@neskjs/common/interfaces';
import { isFunction } from '@neskjs/common/utils/shared.utils';
import { INeskApplicationContext } from '@neskjs/common';

export class NeskApplicationContext implements INeskApplicationContext {
  private readonly moduleTokenFactory = new ModuleTokenFactory();

  constructor(
    protected readonly container: NeskContainer,
    private readonly scope: NeskModuleMetatype[],
    protected contextModule,
  ) {}

  public selectContextModule() {
    const modules = this.container.getModules().values();
    this.contextModule = modules.next().value;
  }

  public select<T>(module: Metatype<T>): INeskApplicationContext {
    const modules = this.container.getModules();
    const moduleMetatype = this.contextModule.metatype;
    const scope = this.scope.concat(moduleMetatype);

    const token = this.moduleTokenFactory.create(module as any, scope);
    const selectedModule = modules.get(token);
    return selectedModule
      ? new NeskApplicationContext(this.container, scope, selectedModule)
      : null;
  }

  public get<T>(metatypeOrToken: Metatype<T> | string | symbol): T {
    return this.findInstanceByPrototypeOrToken<T>(metatypeOrToken);
  }

  private findInstanceByPrototypeOrToken<T>(
    metatypeOrToken: Metatype<T> | string | symbol,
  ) {
    const dependencies = new Map([
      ...this.contextModule.components,
      ...this.contextModule.routes,
      ...this.contextModule.injectables,
    ]);
    const name = isFunction(metatypeOrToken)
      ? (metatypeOrToken as any).name
      : metatypeOrToken;
    const instanceWrapper = dependencies.get(name);
    return instanceWrapper
      ? (instanceWrapper as InstanceWrapper<any>).instance
      : null;
  }
}
