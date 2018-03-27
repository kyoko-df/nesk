import { Interceptor, NeskInterceptor, ExecutionContext } from '../../../../../src/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Interceptor()
export class TransformInterceptor implements NeskInterceptor {
  intercept(
    koaCtx,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    return stream$.map(data => ({ data }));
  }
}
