import { NeskInterceptor } from './nesk-interceptor.interface';
import { CanActivate } from './can-activate.interface';

export interface ConfigurationProvider {
  getGlobalInterceptors(): NeskInterceptor[];
  getGlobalGuards(): CanActivate[];
}
