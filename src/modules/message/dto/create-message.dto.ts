import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RemoveExtraSpaces } from '../../../decorators/custom-validator.decorator';

export class CreateMessageDto {
    @ApiProperty({
        example: 'Hello World',
        description: 'The value of the message',
    })
    @IsNotEmpty()
    @IsString()
    @RemoveExtraSpaces()
    value: string;
}
