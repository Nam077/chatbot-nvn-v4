import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
    @ApiProperty({
        example: 'https://www.google.com',
        description: 'The url of the link',
    })
    @IsNotEmpty()
    @IsString()
    url: string;
}
