import { Module } from '@neskjs/common';
import { CatsService } from './cats.service';
import { CatsResolvers } from './cats.resolvers';

@Module({
  components: [CatsService, CatsResolvers],
})
export class CatsModule {}
