import { mixin } from '@neskjs/common';
import { CacheInterceptor } from './cache.interceptor';

export function mixinCacheInterceptor(isCached: () => boolean) {
  return mixin(
    class extends CacheInterceptor {
      protected readonly isCached = isCached;
    },
  );
}
