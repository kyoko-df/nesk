import { NeskFactory } from '@neskjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3011);
}
bootstrap();
