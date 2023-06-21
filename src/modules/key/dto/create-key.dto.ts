import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateKeyDto {
    @ApiProperty({
        example: 'key1',
        description: 'The name of the key',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'value1',
        description: 'The value of the key',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    value: string;
}
