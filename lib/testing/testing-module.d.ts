import { NeskContainer } from '@neskjs/core/injector/container';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { NeskApplicationContext } from '@neskjs/core';
import { INeskApplication, INeskMicroservice } from '@neskjs/common';
import { MicroserviceConfiguration } from '@neskjs/common/interfaces/microservices/microservice-configuration.interface';
export declare class TestingModule extends NeskApplicationContext {
    constructor(container: NeskContainer, scope: NeskModuleMetatype[], contextModule: any);
    createNestApplication(expressInstance?: any): INeskApplication;
    createNestMicroservice(config: MicroserviceConfiguration): INeskMicroservice;
}
