import * as express from 'express';
import * as optional from 'optional';
import { NeskContainer } from '@neskjs/core/injector/container';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { NeskApplication, NeskApplicationContext } from '@neskjs/core';
import { INeskApplication, INeskMicroservice } from '@neskjs/common';
import { MicroserviceConfiguration } from '@neskjs/common/interfaces/microservices/microservice-configuration.interface';
import { MicroservicesPackageNotFoundException } from '@neskjs/core/errors/exceptions/microservices-package-not-found.exception';
import { ApplicationConfig } from '@neskjs/core/application-config';

const { NestMicroservice } =
  optional('@neskjs/microservices/nesk-microservice') || ({} as any);

export class TestingModule extends NeskApplicationContext {
  constructor(
    container: NeskContainer,
    scope: NeskModuleMetatype[],
    contextModule,
  ) {
    super(container, scope, contextModule);
  }

  public createNestApplication(
    expressInstance: any = express(),
  ): INeskApplication {
    return new NeskApplication(
      this.container,
      expressInstance,
      new ApplicationConfig(),
    );
  }

  public createNestMicroservice(
    config: MicroserviceConfiguration,
  ): INeskMicroservice {
    if (!NestMicroservice) {
      throw new MicroservicesPackageNotFoundException();
    }
    return new NestMicroservice(
      this.container,
      config,
      new ApplicationConfig(),
    );
  }
}
