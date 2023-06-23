import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
    @ApiProperty({
        description: 'User email',
        type: String,
        example: 'nvnfont@gmail.com',
    })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'User name',
        type: String,
        example: 'nvnfont',
    })
    @IsString({ message: 'Name must be string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({
        description: 'User password',
        type: String,
        example: '123456',
    })
    @IsString({ message: 'Password must be string' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
