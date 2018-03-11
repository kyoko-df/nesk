import { Module } from '@neskjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class ApplicationModule {}
