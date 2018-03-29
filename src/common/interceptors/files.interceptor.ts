import * as multer from 'koa-multer';
import { NeskInterceptor } from './../interfaces/nesk-interceptor.interface';
import { Observable } from 'rxjs/Observable';
import { MulterOptions } from '../interfaces/external/multer-options.interface';
import { transformException } from './multer/multer.utils';

export function FilesInterceptor(fieldName: string, maxCount?: number, options?: MulterOptions) {
  const Interceptor = class implements NeskInterceptor {
    readonly upload = multer(options);

    async intercept(
      koaCtx,
      context,
      stream$: Observable<any>,
    ): Promise<Observable<any>> {
      await new Promise((resolve, reject) =>
        this.upload.array(fieldName, maxCount)(koaCtx.req, koaCtx.res, err => {
          if (err) {
            const error = transformException(err);
            return reject(error);
          }
          resolve();
        }),
      );
      return stream$;
    }
  };
  return Interceptor;
}
