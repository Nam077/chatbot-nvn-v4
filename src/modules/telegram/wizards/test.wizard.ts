import { Action, Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { WizardContext } from 'telegraf/typings/scenes';
import { TEST_WIZARD_ID } from '../../../constants/bot-telegram.constants';
import { IsPublic } from '../../../decorators/auth/is-public.decorator';

@Wizard(TEST_WIZARD_ID)
export class TestWizard {
    constructor() {}
    @IsPublic()
    @WizardStep(1)
    protected async step1(@Ctx() ctx: WizardContext) {
        await ctx.reply(
            'Step 1',
            Markup.inlineKeyboard([Markup.button.callback('Вперед', 'YES'), Markup.button.callback('Выход', 'EXIT')]),
        );
        ctx.wizard.next();
    }
    @IsPublic()
    @WizardStep(2)
    @Action(['YES'])
    protected async step2(@Ctx() ctx: WizardContext & { update: Update.CallbackQueryUpdate }) {
        // await ctx.deleteMessage();
        await ctx.reply(
            'Step 2',
            Markup.inlineKeyboard([
                Markup.button.callback('YES', 'YES'),
                Markup.button.callback('BACK', 'BACK'),
                Markup.button.callback('EXIT', 'EXIT'),
            ]),
        );
        ctx.wizard.next();
    }
    @IsPublic()
    @WizardStep(3)
    @Action(['YES', 'BACK'])
    protected async step3(@Ctx() ctx: WizardContext & { update: Update.CallbackQueryUpdate }) {
        const reply = ctx.update.callback_query['data'];
        if (reply === 'YES') {
            // await ctx.deleteMessage();
            await ctx.reply(
                'Step 3',
                Markup.inlineKeyboard([
                    Markup.button.callback('YES', 'YES'),
                    Markup.button.callback('BACK', 'BACK'),
                    Markup.button.callback('EXIT', 'EXIT'),
                ]),
            );
            ctx.wizard.next();
        }
        if (reply === 'BACK') {
            ctx.wizard.back();
        }
    }
    @IsPublic()
    @WizardStep(4)
    @Action(['YES', 'BACK'])
    protected async step4(@Ctx() ctx: WizardContext) {
        // await ctx.deleteMessage();
        await ctx.reply('Step 4, the last');
        await ctx.scene.leave();
    }

    // @Action('BACK')
    // protected async back(@Ctx() ctx) {
    //   await ctx.deleteMessage();
    //   ctx.wizard.back();
    //   ctx.wizard.steps[ctx.wizard.cursor](ctx);
    // }

    @IsPublic()
    @Action('EXIT')
    protected async exit(@Ctx() ctx) {
        await ctx.reply(`Existing`, Markup.removeKeyboard());
        ctx.deleteMessage();
        ctx.scene.leave();
    }
}
