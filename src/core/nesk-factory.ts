import * as optional from 'optional';
import { DependenciesScanner } from './scanner';
import { InstanceLoader } from './injector/instance-loader';
import { NeskContainer } from './injector/container';
import { ExceptionsZone } from './errors/exceptions-zone';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Logger } from '@neskjs/common/services/logger.service';
import { NeskApplicationOptions } from '@neskjs/common/interfaces/nesk-application-options.interface';
import { messages } from './constants';
import { NeskApplication } from './nesk-application';
import { isFunction } from '@neskjs/common/utils/shared.utils';
import { MicroserviceConfiguration } from '@neskjs/common/interfaces/microservices/microservice-configuration.interface';
import { KoaAdapter } from './adapters/koa-adapter';
import {
  INeskApplication,
  INeskMicroservice,
  INeskApplicationContext,
} from '@neskjs/common';
import { MetadataScanner } from './metadata-scanner';
import { MicroservicesPackageNotFoundException } from './errors/exceptions/microservices-package-not-found.exception';
import { NeskApplicationContext } from './nesk-application-context';
import { HttpsOptions } from '@neskjs/common/interfaces/https-options.interface';
import { NeskApplicationContextOptions } from '@neskjs/common/interfaces/nesk-application-context-options.interface';
import { NeskMicroserviceOptions } from '@neskjs/common/interfaces/microservices/nest-microservice-options.interface';
import { ApplicationConfig } from './application-config';

const { NeskMicroservice } =
  optional('@neskjs/microservices/nesk-microservice') || ({} as any);

export class NeskFactoryStatic {
  private readonly logger = new Logger('NestFactory', true);
  /**
   * Creates an instance of the NestApplication (returns Promise)
   * @returns an `Promise` of the INestApplication instance
   */
  public async create(module: any): Promise<INeskApplication>;
  public async create(
    module: any,
    options: NeskApplicationOptions,
  ): Promise<INeskApplication>;
  public async create(
    module: any,
    koa: any,
    options: NeskApplicationOptions,
  ): Promise<INeskApplication>;
  public async create(
    module: any,
    koaOrOptions?: any,
    options?: NeskApplicationOptions,
  ): Promise<INeskApplication> {
    const isKoaInstance = koaOrOptions && koaOrOptions.response;
    const [koaInstance, appOptions] = isKoaInstance
      ? [koaOrOptions, options]
      : [KoaAdapter.create(), koaOrOptions];

    const applicationConfig = new ApplicationConfig();
    const container = new NeskContainer(applicationConfig);

    this.applyLogger(appOptions);
    await this.initialize(
      module,
      container,
      applicationConfig,
      koaInstance,
    );
    return this.createNeskInstance<NeskApplication>(
      new NeskApplication(
        container,
        koaInstance,
        applicationConfig,
        appOptions,
      ),
    );
  }

  /**
   * Creates an instance of the NeskMicroservice (returns Promise)
   *
   * @param  {} module Entry (root) application module class
   * @param  {NeskMicroserviceOptions} options Optional microservice configuration
   * @returns an `Promise` of the INeskMicroservice instance
   */
  public async createMicroservice(
    module,
    options?: NeskMicroserviceOptions,
  ): Promise<INeskMicroservice> {
    if (!NeskMicroservice) {
      throw new MicroservicesPackageNotFoundException();
    }
    const applicationConfig = new ApplicationConfig();
    const container = new NeskContainer(applicationConfig);

    this.applyLogger(options);
    await this.initialize(module, container, applicationConfig);
    return this.createNeskInstance<INeskMicroservice>(
      new NeskMicroservice(container, options as any, applicationConfig),
    );
  }

  /**
   * Creates an instance of the NeskApplicationContext (returns Promise)
   *
   * @param  {} module Entry (root) application module class
   * @param  {NeskApplicationContextOptions} options Optional Nesk application configuration
   * @returns an `Promise` of the INeskApplicationContext instance
   */
  public async createApplicationContext(
    module,
    options?: NeskApplicationContextOptions,
  ): Promise<INeskApplicationContext> {
    const container = new NeskContainer();

    this.applyLogger(options);
    await this.initialize(module, container);

    const modules = container.getModules().values();
    const root = modules.next().value;
    return this.createNeskInstance<INeskApplicationContext>(
      new NeskApplicationContext(container, [], root),
    );
  }

  private createNeskInstance<T>(instance: T) {
    return this.createProxy(instance);
  }

  private async initialize(
    module,
    container: NeskContainer,
    config = new ApplicationConfig(),
    koa = null,
  ) {
    const instanceLoader = new InstanceLoader(container);
    const dependenciesScanner = new DependenciesScanner(
      container,
      new MetadataScanner(),
      config,
    );
    container.setApplicationRef(koa);
    try {
      this.logger.log(messages.APPLICATION_START);
      await ExceptionsZone.asyncRun(async () => {
        dependenciesScanner.scan(module);
        await instanceLoader.createInstancesOfDependencies();
        dependenciesScanner.applyApplicationProviders();
      });
    } catch (e) {
      process.abort();
    }
  }

  private createProxy(target) {
    const proxy = this.createExceptionProxy();
    return new Proxy(target, {
      get: proxy,
      set: proxy,
    });
  }

  private createExceptionProxy() {
    return (receiver, prop) => {
      if (!(prop in receiver)) return;

      if (isFunction(receiver[prop])) {
        return (...args) => {
          let result;
          ExceptionsZone.run(() => {
            result = receiver[prop](...args);
          });
          return result;
        };
      }
      return receiver[prop];
    };
  }

  private applyLogger(options: NeskApplicationContextOptions | undefined) {
    if (!options || !options.logger) {
      return;
    }
    Logger.overrideLogger(options.logger);
  }
}

export const NeskFactory = new NeskFactoryStatic();
