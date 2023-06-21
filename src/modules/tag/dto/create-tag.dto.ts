import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RemoveExtraSpaces, Lowercase } from '../../../decorators/custom-validator.decorator';
export class CreateTagDto {
    @ApiProperty({
        example: 'NestJS',
        description: 'The name of the tag',
    })
    @RemoveExtraSpaces()
    @IsString()
    @Lowercase()
    name: string;
}
