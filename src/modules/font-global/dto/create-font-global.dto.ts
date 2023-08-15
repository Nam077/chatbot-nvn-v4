import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateFontGlobalDto {
    @ApiProperty({ type: 'integer', description: 'Font id' })
    @IsInt()
    id: number;

    @ApiProperty({ description: 'Font name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Font URL' })
    @IsUrl()
    @IsOptional()
    url: string;

    @ApiProperty({ description: 'Font thumbnail URL' })
    @IsUrl()
    @IsOptional()
    thumbnail: string;

    @ApiProperty({ description: 'Font description' })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Font category name' })
    @IsString()
    @IsOptional()
    categoryName: string;

    @ApiProperty({ description: 'Font download link' })
    @IsUrl()
    @IsOptional()
    downloadLink: string;

    @ApiProperty({ description: 'Font detail images' })
    @IsArray()
    @IsOptional()
    detailImages: string;

    @ApiProperty({ description: 'Font more link' })
    @IsUrl()
    @IsOptional()
    moreLink: string;

    @ApiProperty({ description: 'Font file name' })
    @IsString()
    @IsOptional()
    fileName: string;

    @ApiProperty({ description: 'Font Google Drive link' })
    @IsUrl()
    @IsOptional()
    linkDrive: string;

    @ApiProperty({ description: 'Font slug' })
    @IsString()
    @IsOptional()
    slug: string;
}
