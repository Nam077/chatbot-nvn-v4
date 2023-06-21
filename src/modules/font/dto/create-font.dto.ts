import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    Capitalize,
    RemoveAllSpecialCharacters,
    RemoveExtraSpaces,
} from '../../../decorators/custom-validator.decorator';
import { Transform } from 'class-transformer';
import { removeAllSpecialCharacters, removeExtraSpaces } from '../../../utils/string';

export class CreateFontDto {
    @ApiProperty({
        example: 'NestJS',
        description: 'The name of the font',
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

    @ApiProperty({
        example: 'https://www.google.com',
    })
    @IsString({
        message: 'Url must be string',
    })
    @IsNotEmpty({
        message: 'Url is required',
    })
    urlPost: string;

    @ApiProperty({
        example: 'https://www.google.com',
    })
    @IsString({
        message: 'Url must be string',
    })
    @IsNotEmpty({
        message: 'Url is required',
    })
    @IsOptional()
    description: string;

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
    @Transform(({ value }) => value.map((key) => removeAllSpecialCharacters(removeExtraSpaces(key))))
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
        example: ['tag1', 'tag2'],
        description: 'The tags of the font',
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray({
        message: 'Tags must be array',
    })
    tags: string[];

    @ApiProperty({
        example: ['link1', 'link2'],
        description: 'The links of the font',
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray({
        message: 'Links must be array',
    })
    links: string[];

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
