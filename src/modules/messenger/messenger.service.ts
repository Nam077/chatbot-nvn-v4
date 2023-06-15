import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotMessenger, CallToAction, PersistentMenu, UserInformation } from './models/bot-messenger';
import { getTimeCurrent, TimeCurrent } from '../../utils/time';

enum PAYLOADS {
    RESTART_BOT = 'RESTART_BOT',
    TOGGLE_BOT = 'TOGGLE_BOT',
    BUY_ALL_FONTS = 'BUY_ALL_FONTS',
    VIEW_NEW_FONTS = 'VIEW_NEW_FONTS',
    VIEW_ALL_FONTS = 'VIEW_ALL_FONTS',
    VIEW_DEMO_FONTS = 'VIEW_DEMO_FONTS',
    VIEW_GUIDE = 'VIEW_GUIDE',
    VIEW_PRICE = 'VIEW_PRICE',
    CONTACT = 'CONTACT',
    GET_STARTED = 'GET_STARTED',
}

@Injectable()
export class MessengerService {
    constructor(private readonly configService: ConfigService, private messengerBot: BotMessenger) {}

    async getWebHook(mode: string, challenge: string, verifyToken: string) {
        if (mode && verifyToken) {
            if (mode === 'subscribe' && verifyToken === this.configService.get<string>('MESSENGER_VERIFY_TOKEN')) {
                return challenge;
            }
            throw new ForbiddenException('The verify token do not match');
        }
    } //

    async postWebHook(body) {
        const { object, entry } = body;
        if (object === 'page') {
            for (const element of entry) {
                const webhookEvent = element.messaging[0];
                const senderPsid = webhookEvent.sender.id;
                if (webhookEvent.message && webhookEvent.message.quick_reply) {
                    return await this.handleQuickReply(senderPsid, webhookEvent.message.quick_reply);
                }
                if (webhookEvent.message) {
                    return await this.handleMessage(senderPsid, webhookEvent.message.text);
                } else if (webhookEvent.postback) {
                    return await this.handlePostback(senderPsid, webhookEvent.postback);
                }
            }
        }
        return 'EVENT_RECEIVED';
    }

    private async handleMessage(senderPsid: string, message) {
        const time: TimeCurrent = getTimeCurrent('Asia/Ho_Chi_Minh');
        await this.messengerBot.sendTextMessage(senderPsid, `Xin chào! Bây giờ là ${time.dateTime}`);
        const userInformation: UserInformation = await this.messengerBot.getUserProfile(senderPsid);
        await this.messengerBot.sendImageMessage(senderPsid, userInformation.profilePic);
        // await this.messengerBot.sendTextMessage(senderPsid, `Xin chào ${JSON.stringify(userInformation)}!`);
    }

    private async handlePostback(senderPsid: string, postback) {
        const userInformation: UserInformation = await this.messengerBot.getUserProfile(senderPsid);
        if (postback.includes('LIST_FONT')) {
            return await this.handleListFont(senderPsid, postback, userInformation);
        }
        switch (postback.payload) {
            case PAYLOADS.RESTART_BOT:
                return await this.sendStartMessage(senderPsid, userInformation);
            case PAYLOADS.TOGGLE_BOT:
                return await this.toggleBot(senderPsid, userInformation);
            case PAYLOADS.BUY_ALL_FONTS:
                return await this.buyAllFonts(senderPsid, userInformation);
            case PAYLOADS.VIEW_NEW_FONTS:
                return await this.viewNewFonts(senderPsid, userInformation);
            case PAYLOADS.VIEW_ALL_FONTS:
                return await this.viewAllFonts(senderPsid, userInformation);
            case PAYLOADS.VIEW_DEMO_FONTS:
                return await this.viewDemoFonts(senderPsid, userInformation);
            case PAYLOADS.VIEW_GUIDE:
                return await this.viewGuide(senderPsid, userInformation);
            case PAYLOADS.VIEW_PRICE:
                return await this.viewPrice(senderPsid, userInformation);
            case PAYLOADS.CONTACT:
                return await this.contact(senderPsid, userInformation);
            case PAYLOADS.GET_STARTED:
                return await this.sendStartMessage(senderPsid, userInformation);
            default:
                return;
        }
    }

    private async handleQuickReply(senderPsid: string, quickReply) {
        return;
    }

    private getPersistentMenu(): PersistentMenu {
        const callToActions: CallToAction[] = [
            {
                type: 'postback',
                payload: 'RESTART_BOT',
                title: '🔄 Khởi động lại bot',
            },
            {
                // tắt bot
                type: 'postback',
                title: '🔕 Tắt bot',
                payload: 'TOGGLE_BOT',
            },
            {
                // mua tổng hợp font
                type: 'postback',
                title: '🛒 Mua tổng hợp font',
                payload: 'BUY_ALL_FONTS',
            },
            {
                // xem các font mới nhất
                type: 'postback',
                title: '🔥 Xem các font mới nhất',
                payload: 'VIEW_NEW_FONTS',
            },
            {
                // Danh sách các font
                type: 'postback',
                title: '📜 Danh sách các font',
                payload: 'VIEW_ALL_FONTS',
            },
            {
                // Xem demo danh sách font
                type: 'postback',
                title: '📜 Xem demo danh sách font',
                payload: 'VIEW_DEMO_FONTS',
            },
            {
                // Tham gia nhóm
                type: 'web_url',
                title: '👥 Tham gia nhóm',
                url: 'https://www.facebook.com/groups/nvnfont',
            },
            {
                // Hướng dẫn sử dụng
                type: 'postback',
                title: '📖 Hướng dẫn sử dụng',
                payload: 'VIEW_GUIDE',
            },
            {
                // Xem giá việt hóa
                type: 'postback',
                title: '💰 Xem giá việt hóa',
                payload: 'VIEW_PRICE',
            },
            {
                // Liên hệ
                type: 'postback',
                title: '📞 Liên hệ',
                payload: 'CONTACT',
            },
        ];
        return {
            locale: 'default',
            composer_input_disabled: false,
            call_to_actions: callToActions,
        };
    }
    private async sendStartMessage(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async toggleBot(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async buyAllFonts(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async contact(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewPrice(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewGuide(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewDemoFonts(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewAllFonts(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewNewFonts(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async handleListFont(senderPsid: string, postback, userInformation: UserInformation) {
        let page = 1;
        if (postback.include('PAGE')) {
            page = parseInt(postback.replace('LIST_FONT_PAGE_', ''));
        }
        return this.sendListFont(senderPsid, userInformation, page);
    }

    private sendListFont(senderPsid: string, userInformation: UserInformation, page: number) {
        return Promise.resolve(undefined);
    }
}
