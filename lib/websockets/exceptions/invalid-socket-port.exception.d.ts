import { RuntimeException } from '@neskjs/core/errors/exceptions/runtime.exception';
export declare class InvalidSocketPortException extends RuntimeException {
    constructor(port: any, type: any);
}
