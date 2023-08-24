import { FONT_WIZARD_ID } from '../../../constants/bot-telegram.constants';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/typings/scenes';
import { IsPublic } from '../../../decorators/auth/is-public.decorator';

@Wizard(FONT_WIZARD_ID)
export class FontWizard {
    @IsPublic()
    @WizardStep(1)
    async onSceneEnter(@Ctx() ctx: WizardContext): Promise<string> {
        console.log('Enter to scene');
        ctx.wizard.next();
        return 'Vui lòng nhập tên font';
    }
    @IsPublic()
    @WizardStep(2)
    async onStep2(@Ctx() ctx: WizardContext): Promise<string> {
        // send 10 random images
        await ctx.replyWithMediaGroup([
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
            {
                type: 'photo',
                media: 'https://picsum.photos/200/300',
            },
        ]);
        ctx.wizard.next();
        return '';
    }
}
