import { ReflectMetadata } from '../../../../../src/common';

export const Roles = (...roles: string[]) => ReflectMetadata('roles', roles);
