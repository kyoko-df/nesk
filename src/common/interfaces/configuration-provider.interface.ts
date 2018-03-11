import { NestInterceptor } from './nesk-interceptor.interface';
import { CanActivate } from './can-activate.interface';

export interface ConfigurationProvider {
  getGlobalInterceptors(): NestInterceptor[];
  getGlobalGuards(): CanActivate[];
}
