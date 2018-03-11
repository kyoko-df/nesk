import { Module } from '@neskjs/common';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';

@Module({
  imports: [FeatureModule],
})
export class ApplicationModule {}
