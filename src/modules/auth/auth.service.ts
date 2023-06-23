import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
export interface Token {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    sub: string;
    name: string;
    email: string;
}
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    async validateUser(payload: any) {
        const user = await this.userService.findOne(payload.sub);
        delete user.password;
        return user;
    }

    async login(loginDto: LoginDto): Promise<Token> {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        if (!(await user.comparePassword(loginDto.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);
        await this.userService.setCurrentRefreshToken(refreshToken, user.id);
        return {
            accessToken,
            refreshToken,
        };
    }

    async generateAccessToken(payload: User): Promise<string> {
        const payloadJwt: JwtPayload = {
            sub: payload.id.toString(),
            name: payload.name,
            email: payload.email,
        };
        return this.jwtService.signAsync(payloadJwt, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
        });
    }
    async generateRefreshToken(payload: User): Promise<string> {
        const payloadJwt: JwtPayload = {
            sub: payload.id.toString(),
            name: payload.name,
            email: payload.email,
        };

        return this.jwtService.signAsync(payloadJwt, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
        });
    }

    async register(registerDto: RegisterDto) {
        const user = await this.userService.register(registerDto);
        if (user) {
            const accessToken = await this.generateAccessToken(user.data);
            const refreshToken = await this.generateRefreshToken(user.data);
            await this.userService.setCurrentRefreshToken(refreshToken, user.data.id);
            return {
                message: 'User registered successfully',
                accessToken,
                refreshToken,
            };
        }
    }
}
