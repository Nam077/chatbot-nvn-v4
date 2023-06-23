import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(@Inject(UserService) private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException();
        }
        const userInDb = await this.userService.findOne(user.id);
        if (!userInDb) {
            throw new ForbiddenException();
        }
        if (!userInDb.isAdmin()) {
            throw new ForbiddenException();
        }
        return true;
    }
}
