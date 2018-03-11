import { Module } from '@neskjs/common';
import { MathModule } from './math/math.module';

@Module({
  imports: [MathModule],
})
export class ApplicationModule {}
