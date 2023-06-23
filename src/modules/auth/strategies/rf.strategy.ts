import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export class RfStrategy extends PassportStrategy(Strategy, 'rf') {
    constructor(
        private readonly authService: AuthService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {
        super({
            passReqToCallback: true,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
        });
    }

    async validate(request: Request, payload: any) {
        // get refresh token from request header authorization Bearer <refresh_token>
        const refreshToken = await this.extractRefreshTokenFromHeader(request);
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new UnauthorizedException();
        }
        return { user, refreshToken };
    }

    private async extractRefreshTokenFromHeader(req: Request) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException();
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException();
        }
        return token;
    }
}
