import * as express from 'express';
import * as optional from 'optional';
import { NestContainer } from '@neskjs/core/injector/container';
import { NestModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { NestApplication, NestApplicationContext } from '@neskjs/core';
import { INestApplication, INestMicroservice } from '@neskjs/common';
import { MicroserviceConfiguration } from '@neskjs/common/interfaces/microservices/microservice-configuration.interface';
import { MicroservicesPackageNotFoundException } from '@neskjs/core/errors/exceptions/microservices-package-not-found.exception';
import { ApplicationConfig } from '@neskjs/core/application-config';

const { NestMicroservice } =
  optional('@neskjs/microservices/nest-microservice') || ({} as any);

export class TestingModule extends NestApplicationContext {
  constructor(
    container: NestContainer,
    scope: NestModuleMetatype[],
    contextModule,
  ) {
    super(container, scope, contextModule);
  }

  public createNestApplication(
    expressInstance: any = express(),
  ): INestApplication {
    return new NestApplication(
      this.container,
      expressInstance,
      new ApplicationConfig(),
    );
  }

  public createNestMicroservice(
    config: MicroserviceConfiguration,
  ): INestMicroservice {
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
