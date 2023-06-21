import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    Capitalize,
    RemoveAllSpecialCharacters,
    RemoveExtraSpaces,
} from '../../../decorators/custom-validator.decorator';

export class CreateResponseDto {
    @ApiProperty({
        example: 'NestJS',
        description: 'The name of the response',
    })
    @IsString({
        message: 'Name must be string',
    })
    @RemoveExtraSpaces()
    @RemoveAllSpecialCharacters()
    @Capitalize()
    @IsNotEmpty({
        message: 'Name is required',
    })
    name: string;

    // keys, images, tags, links, messages is array of string
    @ApiProperty({
        example: ['key1', 'key2'],
        description: 'The keys of the font',
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray({
        message: 'Keys must be array',
    })
    keys: string[];

    @ApiProperty({
        example: ['image1', 'image2'],
        description: 'The images of the font',
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray({
        message: 'Images must be array',
    })
    images: string[];

    @ApiProperty({
        example: ['message1', 'message2'],
        description: 'The messages of the font',
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray({
        message: 'Messages must be array',
    })
    messages: string[];
}
