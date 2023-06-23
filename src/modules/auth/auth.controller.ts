import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { IsPublic } from '../../decorators/auth/is-public.decorator';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @IsPublic()
    @Post('login')
    @ApiOperation({ summary: 'Login' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @IsPublic()
    @Post('register')
    @ApiOperation({ summary: 'Register' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }
}
