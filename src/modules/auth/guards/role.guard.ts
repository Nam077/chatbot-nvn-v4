import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException();
        }
        if (user.role !== 'admin') {
            throw new ForbiddenException();
        }
        if (!user) throw new ForbiddenException();
        return true;
    }
}
