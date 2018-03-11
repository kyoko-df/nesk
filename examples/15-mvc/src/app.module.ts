import { Module } from '@neskjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  components: [],
})
export class ApplicationModule {}
