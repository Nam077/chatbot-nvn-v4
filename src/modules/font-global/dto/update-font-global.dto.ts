import { PartialType } from '@nestjs/swagger';
import { CreateFontGlobalDto } from './create-font-global.dto';

export class UpdateFontGlobalDto extends PartialType(CreateFontGlobalDto) {}
