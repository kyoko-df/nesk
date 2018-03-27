import { MicroserviceConfiguration } from './microservice-configuration.interface';
import { LoggerService } from '../../services/logger.service';
import { NeskApplicationContextOptions } from '../nesk-application-context-options.interface';

export interface NeskMicroserviceOptions
  extends MicroserviceConfiguration,
    NeskApplicationContextOptions {}
