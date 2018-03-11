import { Module } from '@neskjs/common';
import { MongooseModule } from '@neskjs/mongoose';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), CatsModule],
})
export class ApplicationModule {}
