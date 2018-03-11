import { Module } from '@neskjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  components: [EventsGateway],
})
export class EventsModule {}
