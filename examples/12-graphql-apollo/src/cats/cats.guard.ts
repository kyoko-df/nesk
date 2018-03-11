import { CanActivate, Guard, ExecutionContext } from '@neskjs/common';

@Guard()
export class CatsGuard implements CanActivate {
  canActivate(request: any, context: ExecutionContext): boolean {
    return true;
  }
}
