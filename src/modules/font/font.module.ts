import { Module } from '@nestjs/common';
import { FontService } from './font.service';
import { FontController } from './font.controller';

@Module({
  controllers: [FontController],
  providers: [FontService]
})
export class FontModule {}
