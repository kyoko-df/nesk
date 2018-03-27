import {
  Interceptor,
  NeskInterceptor,
  ExecutionContext,
  HttpStatus,
} from '../../../../../src/common';
import { HttpException } from '../../../../../src/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Interceptor()
export class ExceptionInterceptor implements NeskInterceptor {
  intercept(
    koaCtx,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    return stream$.catch(err =>
      Observable.throw(
        new HttpException(
          'Exception interceptor message',
          HttpStatus.BAD_GATEWAY,
        ),
      ),
    );
  }
}
