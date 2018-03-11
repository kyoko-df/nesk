import { Module, SingleScope } from '@neskjs/common';
import { CommonService } from './common.service';

@Module({
  components: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
