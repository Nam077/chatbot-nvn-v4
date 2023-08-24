import { Update, Start, Command, Ctx } from 'nestjs-telegraf';
import { IsPublic } from '../../decorators/auth/is-public.decorator';
import { Context } from '../../interfaces/telegraf-context.interface';
import { FONT_WIZARD_ID } from '../../constants/bot-telegram.constants';

@Update()
export class BotUpdate {
    @IsPublic()
    @Start()
    async onStart() {
        return 'Hello';
    }
    @IsPublic()
    @Command('font')
    async font(@Ctx() ctx: Context) {
        return ctx.scene.enter(FONT_WIZARD_ID);
    }
}
