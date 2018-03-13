import * as koa from 'koa';
import * as path from 'path';
import * as serve from 'koa-static';
import { NeskFactory } from '@neskjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.create(ApplicationModule);

  app.use(serve(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  await app.listen(3000);
}
bootstrap();
