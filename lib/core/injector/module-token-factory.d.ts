import { NeskModuleMetatype } from '@neskjs/common/interfaces/modules/module-metatype.interface';
import { DynamicModule } from '@neskjs/common';
export declare class ModuleTokenFactory {
    create(metatype: NeskModuleMetatype, scope: NeskModuleMetatype[], dynamicModuleMetadata?: Partial<DynamicModule> | undefined): string;
    getDynamicMetadataToken(dynamicModuleMetadata: Partial<DynamicModule> | undefined): string;
    getModuleName(metatype: NeskModuleMetatype): string;
    getScopeStack(scope: NeskModuleMetatype[]): string[];
    private reflectScope(metatype);
}
