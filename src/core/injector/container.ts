import 'reflect-metadata';
import { Controller, Injectable } from '@neskjs/common/interfaces';
import { GLOBAL_MODULE_METADATA } from '@neskjs/common/constants';
import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
import { SHARED_MODULE_METADATA } from '@neskjs/common/constants';
import { isUndefined } from '@neskjs/common/utils/shared.utils';
import { Module } from './module';
import { UnknownModuleException } from '../errors/exceptions/unknown-module.exception';
import { ModuleTokenFactory } from './module-token-factory';
import { InvalidModuleException } from './../errors/exceptions/invalid-module.exception';
import { DynamicModule } from '@neskjs/common';
import { ModulesContainer } from './modules-container';
import { NeskApplicationContext } from './../nesk-application-context';
import { ApplicationConfig } from './../application-config';

export class NeskContainer {
  private readonly globalModules = new Set<Module>();
  private readonly modules = new ModulesContainer();
  private readonly dynamicModulesMetadata = new Map<
    string,
    Partial<DynamicModule>
  >();
  private readonly moduleTokenFactory = new ModuleTokenFactory();
  private applicationRef: any;

  constructor(
    private readonly _applicationConfig: ApplicationConfig = void 0,
  ) {}

  get applicationConfig(): ApplicationConfig | undefined {
    return this._applicationConfig;
  }

  public setApplicationRef(applicationRef: any) {
    this.applicationRef = applicationRef;
  }

  public getApplicationRef() {
    return this.applicationRef;
  }

  public addModule(
    metatype: NeskModuleMetatype | DynamicModule,
    scope: NeskModuleMetatype[],
  ) {
    if (!metatype) {
      throw new InvalidModuleException(scope);
    }
    const { type, dynamicMetadata } = this.extractMetadata(metatype);
    const token = this.moduleTokenFactory.create(type, scope, dynamicMetadata);
    if (this.modules.has(token)) {
      return;
    }
    const module = new Module(type, scope, this);
    this.modules.set(token, module);

    this.addDynamicMetadata(token, dynamicMetadata, [].concat(scope, type));
    this.isGlobalModule(type) && this.addGlobalModule(module);
  }

  public extractMetadata(
    metatype: NeskModuleMetatype | DynamicModule,
  ): {
    type: NeskModuleMetatype;
    dynamicMetadata?: Partial<DynamicModule> | undefined;
  } {
    if (!this.isDynamicModule(metatype)) {
      return { type: metatype };
    }
    const { module: type, ...dynamicMetadata } = metatype;
    return { type, dynamicMetadata };
  }

  public isDynamicModule(
    module: NeskModuleMetatype | DynamicModule,
  ): module is DynamicModule {
    return (module as DynamicModule).module;
  }

  public addDynamicMetadata(
    token: string,
    dynamicModuleMetadata: Partial<DynamicModule>,
    scope: NeskModuleMetatype[],
  ) {
    if (!dynamicModuleMetadata) {
      return undefined;
    }
    this.dynamicModulesMetadata.set(token, dynamicModuleMetadata);

    const { modules, imports } = dynamicModuleMetadata;
    this.addDynamicModules(modules, scope);
    this.addDynamicModules(imports, scope);
  }

  public addDynamicModules(modules: any[], scope: NeskModuleMetatype[]) {
    if (!modules) {
      return;
    }
    modules.map(module => this.addModule(module, scope));
  }

  public isGlobalModule(metatype: NeskModuleMetatype): boolean {
    return !!Reflect.getMetadata(GLOBAL_MODULE_METADATA, metatype);
  }

  public addGlobalModule(module: Module) {
    this.globalModules.add(module);
  }

  public getModules(): ModulesContainer {
    return this.modules;
  }

  public addRelatedModule(
    relatedModule: NeskModuleMetatype | DynamicModule,
    token: string,
  ) {
    if (!this.modules.has(token)) return;

    const module = this.modules.get(token);
    const parent = module.metatype;

    const { type, dynamicMetadata } = this.extractMetadata(relatedModule);
    const relatedModuleToken = this.moduleTokenFactory.create(
      type,
      [].concat(module.scope, parent),
      dynamicMetadata,
    );
    const related = this.modules.get(relatedModuleToken);
    module.addRelatedModule(related);
  }

  public addComponent(component: Metatype<Injectable>, token: string): string {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }
    const module = this.modules.get(token);
    return module.addComponent(component);
  }

  public addInjectable(injectable: Metatype<Injectable>, token: string) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }
    const module = this.modules.get(token);
    module.addInjectable(injectable);
  }

  public addExportedComponent(
    exportedComponent: Metatype<Injectable>,
    token: string,
  ) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }
    const module = this.modules.get(token);
    module.addExportedComponent(exportedComponent);
  }

  public addController(controller: Metatype<Controller>, token: string) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }
    const module = this.modules.get(token);
    module.addRoute(controller);
  }

  public clear() {
    this.modules.clear();
  }

  public replace(toReplace, options: any & { scope: any[] | null }) {
    [...this.modules.values()].forEach(module => {
      module.replace(toReplace, options);
    });
  }

  public bindGlobalScope() {
    this.modules.forEach(module => this.bindGlobalsToRelatedModules(module));
  }

  public bindGlobalsToRelatedModules(module: Module) {
    this.globalModules.forEach(globalModule =>
      this.bindGlobalModuleToModule(module, globalModule),
    );
  }

  public bindGlobalModuleToModule(module: Module, globalModule: Module) {
    if (module === globalModule) {
      return undefined;
    }
    module.addRelatedModule(globalModule);
  }

  public getDynamicMetadataByToken(
    token: string,
    metadataKey: keyof DynamicModule,
  ): any[] {
    const metadata = this.dynamicModulesMetadata.get(token);
    if (metadata && metadata[metadataKey]) {
      return metadata[metadataKey];
    }
    return [];
  }
}

export interface InstanceWrapper<T> {
  name: any;
  metatype: Metatype<T>;
  instance: T;
  isResolved: boolean;
  isPending?: boolean;
  done$?: Promise<void>;
  inject?: Metatype<any>[];
  isNotMetatype?: boolean;
  forwardRef?: boolean;
  async?: boolean;
}
