import { Interceptor, NeskInterceptor, ExecutionContext } from '@neskjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Interceptor()
export class CacheInterceptor implements NeskInterceptor {
  intercept(
    dataOrRequest,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    const isCached = true;
    if (isCached) {
      return Observable.of([]);
    }
    return stream$;
  }
}
