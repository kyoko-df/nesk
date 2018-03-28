import { Module } from '@neskjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  components: [CatsService],
})
export class CatsModule {}
