import { Module } from '../../../src/common';
import { AppController } from './app.controller';
import { TestController } from './test.controller';

@Module({
  imports: [],
  controllers: [AppController, TestController],
  components: [],
})
export class ApplicationModule {}
