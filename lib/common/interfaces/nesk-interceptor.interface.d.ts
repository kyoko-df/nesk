import { Observable } from 'rxjs/Observable';
import { ExecutionContext } from './execution-context.interface';
export interface NeskInterceptor {
    intercept(dataOrRequest: any, context: ExecutionContext, stream$: Observable<any>): Observable<any> | Promise<Observable<any>>;
}
