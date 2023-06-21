import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
    // with swagger options
    @ApiProperty({
        description: 'Setting key',
        example: 'site_name',
    })
    @IsString({ message: 'Key must be string' })
    @IsNotEmpty({ message: 'Key is required' })
    key: string;

    @ApiProperty({
        description: 'Setting value',
        example: 'My site',
    })
    @IsString({ message: 'Value must be string' })
    @IsNotEmpty({ message: 'Value is required' })
    value: string;

    @ApiProperty({
        description: 'Setting description',
        example: 'My site',
    })
    @IsString({ message: 'Description must be string' })
    @IsNotEmpty({ message: 'Description is required' })
    @IsOptional()
    description: string;
}
