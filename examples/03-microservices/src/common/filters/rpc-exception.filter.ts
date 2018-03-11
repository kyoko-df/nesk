import { Catch, RpcExceptionFilter } from '@neskjs/common';
import { Observable } from 'rxjs/Observable';
import { RpcException } from '@neskjs/microservices';
import 'rxjs/add/observable/throw';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException): Observable<any> {
    return Observable.throw(exception.getError());
  }
}
