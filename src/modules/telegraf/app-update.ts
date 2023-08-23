import { Injectable } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { IsPublic } from '../../decorators/auth/is-public.decorator';

@Update()
@Injectable()
export class AppUpdate {
    @IsPublic()
    @Command('random')
    async onRandom(@Ctx() ctx: Context) {
        await ctx.reply(Math.random().toString());
    }

    @IsPublic()
    @Command('start')
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply('Welcome');
    }
}
