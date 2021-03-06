import { isFunction } from '@neskjs/common/utils/shared.utils';
import { Metatype } from '@neskjs/common/interfaces';

export const filterMiddlewares = middlewares => {
  return []
    .concat(middlewares)
    .filter(isFunction)
    .map(middleware => mapToClass(middleware));
};

export const mapToClass = middleware => {
  if (this.isClass(middleware)) {
    return middleware;
  }
  return assignToken(
    class {
      public resolve = (...args) => (ctx, next) =>
        middleware(ctx, next);
    },
  );
};

export const isClass = middleware => {
  return middleware.toString().substring(0, 5) === 'class';
};

export const assignToken = (metatype): Metatype<any> => {
  this.id = this.id || 1;
  Object.defineProperty(metatype, 'name', { value: ++this.id });
  return metatype;
};
