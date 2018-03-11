import {
  NestContainer,
  InstanceWrapper,
} from '@neskjs/core/injector/container';
import { ModuleMetadata } from '@neskjs/common/interfaces/modules/module-metadata.interface';
import { Module } from '@neskjs/common/utils/decorators/module.decorator';
import { DependenciesScanner } from '@neskjs/core/scanner';
import { InstanceLoader } from '@neskjs/core/injector/instance-loader';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
import { Logger } from '@neskjs/common/services/logger.service';
import { NestEnvironment } from '@neskjs/common/enums/nest-environment.enum';
import { MetadataScanner } from '@neskjs/core/metadata-scanner';
import { TestingModuleBuilder } from './testing-module.builder';

export class Test {
  private static metadataScanner = new MetadataScanner();

  public static createTestingModule(metadata: ModuleMetadata) {
    this.init();
    return new TestingModuleBuilder(this.metadataScanner, metadata);
  }

  private static init() {
    Logger.setMode(NestEnvironment.TEST);
  }
}
