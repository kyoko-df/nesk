import { MiddlewareConfiguration } from '@neskjs/common/interfaces/middlewares/middleware-configuration.interface';
import { NeskMiddleware } from '@neskjs/common/interfaces/middlewares/nesk-middleware.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';

export class MiddlewaresContainer {
  private readonly middlewares = new Map<
    string,
    Map<string, MiddlewareWrapper>
  >();
  private readonly configs = new Map<string, Set<MiddlewareConfiguration>>();

  public getMiddlewares(module: string): Map<string, MiddlewareWrapper> {
    return this.middlewares.get(module) || new Map();
  }

  public getConfigs(): Map<string, Set<MiddlewareConfiguration>> {
    return this.configs;
  }

  public addConfig(configList: MiddlewareConfiguration[], module: string) {
    const middlewares = this.getCurrentMiddlewares(module);
    const currentConfig = this.getCurrentConfig(module);

    const configurations = configList || [];
    configurations.map(config => {
      [].concat(config.middlewares).map(metatype => {
        const token = metatype.name;
        middlewares.set(token, {
          instance: null,
          metatype,
        });
      });
      currentConfig.add(config);
    });
  }

  private getCurrentMiddlewares(module: string) {
    if (!this.middlewares.has(module)) {
      this.middlewares.set(module, new Map<string, MiddlewareWrapper>());
    }
    return this.middlewares.get(module);
  }

  private getCurrentConfig(module: string) {
    if (!this.configs.has(module)) {
      this.configs.set(module, new Set<MiddlewareConfiguration>());
    }
    return this.configs.get(module);
  }
}

export interface MiddlewareWrapper {
  instance: NeskMiddleware;
  metatype: Metatype<NeskMiddleware>;
}
