import { Interceptor, NeskInterceptor, ExecutionContext } from '../../../../../src/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Interceptor()
export abstract class CacheInterceptor implements NeskInterceptor {
  protected abstract readonly isCached: () => boolean;

  intercept(
    koaCtx,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    if (this.isCached()) {
      return Observable.of([]);
    }
    return stream$;
  }
}
