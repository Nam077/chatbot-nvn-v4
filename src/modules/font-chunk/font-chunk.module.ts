import { Module } from '@nestjs/common';
import { FontChunkService } from './font-chunk.service';
import { FontChunkController } from './font-chunk.controller';

@Module({
  controllers: [FontChunkController],
  providers: [FontChunkService]
})
export class FontChunkModule {}
