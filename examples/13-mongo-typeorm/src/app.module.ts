import { Module } from '@neskjs/common';
import { TypeOrmModule } from '@neskjs/typeorm';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [TypeOrmModule.forRoot(), PhotoModule],
})
export class ApplicationModule {}
