import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { Capitalize, Lowercase } from '../../../decorators/custom-validator.decorator';

export class CreateUserDto {
    @ApiProperty({
        type: String,
        description: 'The email of the user',
        required: true,
        example: 'nvnfont@gmail.com',
    })
    @Lowercase()
    @IsEmail(
        {},
        {
            message: 'Email is invalid',
        },
    )
    @IsNotEmpty({
        message: 'Email is required',
    })
    email: string;

    @ApiProperty({
        type: String,
        description: 'The password of the user',
        required: true,
        example: '123456',
    })
    @IsString({
        message: 'Password must be string',
    })
    @Length(6, 20, {
        message: 'Password must be between 6 and 20 characters',
    })
    @IsNotEmpty({
        message: 'Password is required',
    })
    password: string;

    @ApiProperty({
        type: String,
        description: 'The name of the user',
        required: true,
        example: 'Nguyen Van Nghia',
    })
    @Capitalize()
    @IsString({
        message: 'Name must be string',
    })
    @IsNotEmpty({
        message: 'Name is required',
    })
    name: string;

    @ApiProperty({
        type: String,
        description: 'The role of the user',
        required: true,
        example: 'admin',
        enum: ['admin', 'user'],
        default: 'user',
    })
    @IsString({
        message: 'Role must be string',
    })
    @IsIn(['admin', 'user'], {
        message: 'Role must be admin or user',
    })
    role: string;
}
