import * as koa from 'koa';
import * as path from 'path';
import { NeskFactory } from '../../../src/core/nesk-factory';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.create(ApplicationModule, {
    view: { root: __dirname + '/views', extension: 'jade' },
  });

  app.use(async (ctx, next) => {
    await next();
    console.log(2)
  })

  await app.listen(3000);
}
bootstrap();
