import { NeskFactory } from '@neskjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
