import { Controller } from '@neskjs/common/interfaces/index';
import { Metatype } from '@neskjs/common/interfaces/metatype.interface';
export interface RouterExplorer {
    explore(instance: Controller, metatype: Metatype<Controller>, module: string): any;
    fetchRouterPath(metatype: Metatype<Controller>, prefix?: string): string;
}
