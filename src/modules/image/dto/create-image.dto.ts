import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RemoveExtraSpaces } from '../../../decorators/custom-validator.decorator';

export class CreateImageDto {
    @ApiProperty({
        example: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
        description: 'The url of the image',
    })
    @RemoveExtraSpaces()
    @IsString()
    url: string;
}
