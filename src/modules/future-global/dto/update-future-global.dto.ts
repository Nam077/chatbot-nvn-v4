import { PartialType } from '@nestjs/swagger';
import { CreateFutureGlobalDto } from './create-future-global.dto';

export class UpdateFutureGlobalDto extends PartialType(CreateFutureGlobalDto) {}
