import { Controller } from '@neskjs/common/interfaces';
import { ExecutionContext, NeskInterceptor } from '@neskjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/switchMap';
export declare class InterceptorsConsumer {
    intercept(interceptors: NeskInterceptor[], data: any, instance: Controller, callback: (...args) => any, next: () => Promise<any>): Promise<any>;
    createContext(instance: Controller, callback: (...args) => any): ExecutionContext;
    transformDeffered(next: () => Promise<any>): Observable<any>;
}
