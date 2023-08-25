import { FONT_WIZARD_ID } from '../../../constants/bot-telegram.constants';
import { Ctx, Message, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/typings/scenes';
import { IsPublic } from '../../../decorators/auth/is-public.decorator';
import { ChatService } from '../../chat/chat.service';
import { Font, FontStatus } from '../../font/entities/font.entity';
import { getRanDomBetween } from '../../../utils/number';
import { ConfigService } from '@nestjs/config';

@Wizard(FONT_WIZARD_ID)
export class FontWizard {
    constructor(
        private readonly chatService: ChatService,
        private readonly configService: ConfigService,
    ) {}
    @IsPublic()
    @WizardStep(0)
    async onSceneEnter(@Ctx() ctx: WizardContext): Promise<string> {
        console.log(ctx.from);
        console.log(ctx.wizard.cursor);
        console.log('Enter to scene');
        ctx.wizard.next();
        return 'Vui lòng nhập tên font';
    }
    @IsPublic()
    @WizardStep(1)
    async onStep1(@Ctx() ctx: WizardContext, @Message() msg: { text: string }): Promise<string> {
        // send typing
        await ctx.sendChatAction('typing');
        ctx.wizard.state['name'] = msg.text;
        ctx.wizard.next();
        const { fonts } = await this.chatService.getDataFromMessage(msg.text);
        if (fonts.length > 0) {
            const font = fonts[0];
            const { status } = font;
            if (status === FontStatus.ACTIVE) {
                await ctx.sendChatAction('upload_photo');
                await ctx.replyWithPhoto({
                    url:
                        font.images.length > 0
                            ? font.images[getRanDomBetween(0, font.images.length - 1)].url
                            : this.configService.get('BACKUP_IMAGE_URL'),
                    filename: 'font.png',
                });
                const tempMessage =
                    font.messages.length > 0
                        ? font.messages[getRanDomBetween(0, font.messages.length - 1)].value
                        : font.name;

                const message = `Chào ${ctx.from.first_name}\nTôi đã nhận được yêu cầu của bạn\nTên font: ${
                    font.name
                } \nLink tải:\n\n${this.getLinkDownload(font)}\n${tempMessage}`;
                await ctx.sendChatAction('typing');
                await ctx.reply(message, { reply_markup: { remove_keyboard: true } });
                await ctx.scene.leave();
                return '';
            }
            await ctx.scene.leave();
            ctx.wizard.next();
            return 'Font này hiện đang tạm khóa';
        } else {
            ctx.wizard.back();
            await ctx.reply('Không tìm thấy font');
            return 'Vui lòng nhập tên font';
        }
    }

    getLinkDownload(font: Font): string {
        let linkDownload = '';
        for (let i = 0; i < font.links.length && i < 3; i++) {
            linkDownload += font.links[i].url + '\n';
        }
        return linkDownload;
    }
}
