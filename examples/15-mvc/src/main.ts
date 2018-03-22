import * as koa from 'koa';
import * as path from 'path';
// import * as serve from 'koa-static';
import * as views from 'koa-views';
import { NeskFactory } from '../../../src/core/nesk-factory';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.create(ApplicationModule);

  // app.use(serve(path.join(__dirname, 'public')));
  // app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.use(views(__dirname + '/views', { extension: 'jade' }));

  await app.listen(3001);
}
bootstrap();
