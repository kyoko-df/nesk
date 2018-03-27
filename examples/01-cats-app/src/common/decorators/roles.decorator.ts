import { ReflectMetadata } from '@neskjs/common';

export const Roles = (...roles: string[]) => ReflectMetadata('roles', roles);
