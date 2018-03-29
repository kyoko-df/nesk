import * as multer from 'koa-multer';
import { NeskInterceptor } from './../interfaces/nesk-interceptor.interface';
import { Observable } from 'rxjs/Observable';
import { MulterOptions } from '../interfaces/external/multer-options.interface';
import { mixin } from '../decorators/core/component.decorator';
import { transformException } from './multer/multer.utils';

export function FileInterceptor(fieldName: string, options?: MulterOptions) {
  return mixin(
    class implements NeskInterceptor {
      readonly upload = multer(options);

      async intercept(
        koaCtx,
        context,
        stream$: Observable<any>,
      ): Promise<Observable<any>> {
        await new Promise((resolve, reject) =>
          this.upload.single(fieldName)(koaCtx.req, koaCtx.res, err => {
            if (err) {
              const error = transformException(err);
              return reject(error);
            }
            resolve();
          }),
        );
        return stream$;
      }
    },
  );
}
