import { Observable } from 'rxjs/Observable';
import { MulterOptions } from '../interfaces/external/multer-options.interface';
export declare function FilesInterceptor(fieldName: string, maxCount?: number, options?: MulterOptions): {
    new (): {
        readonly upload: any;
        intercept(koaCtx: any, context: any, stream$: Observable<any>): Promise<Observable<any>>;
    };
};
