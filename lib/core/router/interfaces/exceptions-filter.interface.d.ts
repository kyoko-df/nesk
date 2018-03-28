import { Controller } from '@neskjs/common/interfaces/controllers/controller.interface';
import { ExceptionsHandler } from '../../exceptions/exceptions-handler';
export interface ExceptionsFilter {
    create(instance: Controller, callback: any): ExceptionsHandler;
}
