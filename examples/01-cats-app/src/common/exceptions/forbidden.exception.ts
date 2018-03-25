import { HttpException } from '../../../../../src/common';
import { HttpStatus } from '../../../../../src/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
