import { PartialType } from '@nestjs/swagger';
import { CreateFontChunkDto } from './create-font-chunk.dto';

export class UpdateFontChunkDto extends PartialType(CreateFontChunkDto) {}
