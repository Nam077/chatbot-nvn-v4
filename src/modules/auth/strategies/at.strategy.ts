import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Inject, UnauthorizedException } from '@nestjs/common';

export class AtStrategy extends PassportStrategy(Strategy, 'at') {
    constructor(
        private readonly authService: AuthService,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: any) {
        const user = await this.authService.validateUser(payload);
        console.log('user', user);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
