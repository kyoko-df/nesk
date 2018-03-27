import * as koa from 'koa';
import * as path from 'path';
import { NeskFactory } from '@neskjs/core/nesk-factory';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.create(ApplicationModule);

  app.engine(__dirname + '/views', {extension: 'jade'});

  await app.listen(3000);
}
bootstrap();
