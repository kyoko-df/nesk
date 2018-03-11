import { HttpException } from '@neskjs/common';
import { HttpStatus } from '@neskjs/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
