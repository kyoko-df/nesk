import { Module } from '@neskjs/common';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
})
export class ApplicationModule {}
