import { NeskFactory } from '@neskjs/core';
import { Transport } from '@neskjs/microservices';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NeskFactory.createMicroservice(ApplicationModule);
  await app.listenAsync();

  /** Hybrid application (HTTP + (n)Microservices)
  const app = await NestFactory.create(ApplicationModule);
  app.connectMicroservice({
    transport: Transport.TCP,
  });

  await app.startAllMicroservicesAsync();
  await app.listen(3001); */
}
bootstrap();
