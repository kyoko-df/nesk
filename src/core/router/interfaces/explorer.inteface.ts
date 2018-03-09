import { Controller } from '../../../common/interfaces/index';
import { Metatype } from '../../../common/interfaces/metatype.interface';

export interface RouterExplorer {
  explore(instance: Controller, metatype: Metatype<Controller>, module: string);
  fetchRouterPath(metatype: Metatype<Controller>, prefix?: string): string;
}
