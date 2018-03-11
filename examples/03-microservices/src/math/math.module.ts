import { Module } from '@neskjs/common';
import { MathController } from './math.controller';

@Module({
  controllers: [MathController],
})
export class MathModule {}
