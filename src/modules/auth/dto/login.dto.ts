import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Lowercase } from '../../../decorators/custom-validator.decorator';
export class LoginDto {
    @ApiProperty({
        description: 'User email',
        type: String,
        example: 'nvnfont@gmail.com',
    })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    @Lowercase()
    email: string;

    @ApiProperty({
        description: 'User password',
        type: String,
        example: '123456',
    })
    @IsString({ message: 'Password must be string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
