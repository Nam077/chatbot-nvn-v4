import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotMessenger, CallToAction, Element, PersistentMenu, UserInformation } from './models/bot-messenger';
import { getTimeCurrent, TimeCurrent } from '../../utils/time';
import { ChatService } from '../chat/chat.service';
import { QuickReply } from '../../common/bot';
import { CrawDataYoutube } from '../chat/crawler/crawler.service';
export const INTENT_START = ['bắt đầu', 'start', 'restart', 'restart bot', 'khởi động lại', 'khởi động lại'];
export const COMMANDS_ADMIN = ['@ban', '@unban', '@multiple', '@bot', '@admin', '@token', '@update'];
enum PAYLOADS {
    RESTART_BOT = 'RESTART_BOT',
    TOGGLE_BOT = 'TOGGLE_BOT',
    BUY_ALL_FONTS = 'BUY_ALL_FONTS',
    VIEW_NEW_FONTS = 'VIEW_NEW_FONTS',
    VIEW_ALL_FONTS = 'VIEW_ALL_FONTS',
    VIEW_LIST_FONTS_TEXT = 'VIEW_LIST_FONTS_TEXT',
    VIEW_GUIDE = 'VIEW_GUIDE',
    VIEW_PRICE = 'VIEW_PRICE',
    CONTACT = 'CONTACT',
    GET_STARTED = 'GET_STARTED',
}

@Injectable()
export class MessengerService {
    private listOffBan: Set<string> = new Set();
    constructor(
        private readonly configService: ConfigService,
        private messengerBot: BotMessenger,
        private readonly chatService: ChatService,
    ) {}

    private addListOffBan(senderPsid: string) {
        this.listOffBan.add(senderPsid);
    }
    private removeListOffBan(senderPsid: string) {
        this.listOffBan.delete(senderPsid);
    }
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
                if (senderPsid === this.configService.get<string>('MESSENGER_PAGE_ID')) {
                    return 'EVENT_RECEIVED';
                }
                console.log('Sender PSID: ' + senderPsid);
                if (webhookEvent.message && webhookEvent.message.quick_reply) {
                    if (await this.checkBan(senderPsid)) {
                        return 'EVENT_RECEIVED';
                    }
                    //
                    return await this.handleQuickReply(senderPsid, webhookEvent.message.quick_reply);
                }
                if (webhookEvent.message) {
                    if (await this.checkBan(senderPsid)) {
                        return 'EVENT_RECEIVED';
                    }
                    return await this.handleMessage(senderPsid, webhookEvent.message.text);
                } else if (webhookEvent.postback) {
                    if (await this.checkBan(senderPsid)) {
                        return 'EVENT_RECEIVED';
                    }
                    return await this.handlePostback(senderPsid, webhookEvent.postback);
                }
            }
        }
        return 'EVENT_RECEIVED';
    }
    private async checkBan(senderPsid: string): Promise<boolean> {
        const banned = await this.chatService.checkBanned(senderPsid);
        if (banned.isBanned) {
            await this.messengerBot.sendTextMessage(senderPsid, 'Bạn đã bị cấm sử dụng bot');
            await this.messengerBot.sendTextMessage(senderPsid, senderPsid);
            await this.messengerBot.sendTextMessage(senderPsid, `Lý do: ${banned.ban.reason}`);
            await this.messengerBot.sendTextMessage(
                senderPsid,
                'Vui lòng liên hệ admin để được hỗ trợ\nm.me/nam077.me',
            );
            return true;
        }
        return false;
    }
    private async handleMessage(senderPsid: string, message) {
        const time: TimeCurrent = getTimeCurrent('Asia/Ho_Chi_Minh');
        const userInformation: UserInformation = await this.messengerBot.getUserProfile(senderPsid);
        INTENT_START.forEach((intent) => {
            if (message.toLowerCase().includes(intent)) {
                return this.sendStartMessage(senderPsid, userInformation);
            }
        });
        COMMANDS_ADMIN.forEach((command) => {
            if (message.toLowerCase().includes(command)) {
                return this.handleAdminCommand(senderPsid, message);
            }
        });
        if (message.toLowerCase().includes('@yt')) {
            const data = await this.chatService.getYouTubeSearch(message);
            if (data) {
                await this.sendYoutubeMessage(senderPsid, data);
            }
        }
        return await this.toggleBot(senderPsid, userInformation);
    }

    private readonly sendYoutubeMessage = async (senderPsid: string, data: CrawDataYoutube[]) => {
        const elements: Element[] = data.map((item) => {
            return {
                title: item.title,
                image_url: item.thumbnail || 'https://picsum.photos/600/40' + Math.floor(Math.random() * 10),
                buttons: [
                    {
                        type: 'web_url',
                        title: 'Xem ngay',
                        url: item.url,
                    },
                ],
                default_action: {
                    type: 'web_url',
                    url: item.url,
                },
                subtitle: item.duration,
            };
        });
        await this.messengerBot.sendGenericMessage(senderPsid, elements);
    };
    private async handleAdminCommand(senderPsid: string, message: string) {
        const result = await this.chatService.adminFunctions(message);
        if (result.command === 'BAN') {
            if (result.isSuccessful) {
                const senderInformation: UserInformation = await this.messengerBot.getUserProfile(
                    result.data.senderPsid,
                );
                if (senderInformation.name === 'Bạn') {
                    await this.messengerBot.sendTextMessage(senderPsid, 'Người dùng không tồn tại');
                    await this.chatService.deleteBanned(result.data.senderPsid);
                } else {
                    await this.messengerBot.sendTextMessage(
                        senderPsid,
                        `Đã cấm sử dụng bot cho người dùng ${senderInformation.name}`,
                    );
                    await this.messengerBot.sendTextMessage(
                        result.data.senderPsid,
                        `Bạn đã bị cấm sử dụng bot\nLý do: ${result.data.reason}`,
                    );
                }
            } else {
                await this.messengerBot.sendTextMessage(senderPsid, result.message);
            }
        } else if (result.command === 'UPDATE_PAGE_ACCESS_TOKEN') {
            if (result.isSuccessful) {
                this.messengerBot.pageAccessToken = result.data;
                await this.messengerBot.sendTextMessage(senderPsid, 'Cập nhật thành công');
            } else {
                await this.messengerBot.sendTextMessage(senderPsid, result.message);
            }
        } else if (result.command === 'ADMIN_LIST') {
            if (result.isSuccessful) {
                const dataMessage = result.data.map((item) => {
                    return item.join('\n\n');
                });
                await this.messengerBot.sendMultipleTextMessage(senderPsid, dataMessage);
            } else {
                await this.messengerBot.sendTextMessage(senderPsid, result.message);
            }
        } else if (result.command === 'BAN_LIST') {
            if (result.isSuccessful) {
                const dataMessage = result.data.map((item) => {
                    return item.join('\n\n');
                });
                await this.messengerBot.sendMultipleTextMessage(senderPsid, dataMessage);
            } else {
                await this.messengerBot.sendTextMessage(senderPsid, result.message);
            }
        } else await this.messengerBot.sendTextMessage(senderPsid, result.message);
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
            case PAYLOADS.VIEW_LIST_FONTS_TEXT:
                return await this.viewListFontsText(senderPsid, userInformation);
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
        await this.messengerBot.sendTextMessage(senderPsid, senderPsid);
        const timeCurrent: TimeCurrent = getTimeCurrent('Asia/Ho_Chi_Minh');
        const message: string = handelTime(timeCurrent);
        await this.messengerBot.sendTextMessage(senderPsid, message);
        await this.messengerBot.sendImageMessage(senderPsid, userInformation.profilePic);
        await this.sendQuickReplyStart(senderPsid);

        function handelTime(timeCurrent: TimeCurrent) {
            if (timeCurrent.hour >= 0 && timeCurrent.hour <= 3) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nBạn nhắn tin giờ này là đang làm phiền admin đấy nhé!`;
            }
            if (timeCurrent.hour >= 4 && timeCurrent.hour <= 11) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nChúc bạn một ngày mới tốt lành!`;
            }
            if (timeCurrent.hour >= 11 && timeCurrent.hour <= 12) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nKhông biết bạn đã ăn trưa chưa nhỉ?`;
            }
            if (timeCurrent.hour >= 13 && timeCurrent.hour <= 16) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nChúc bạn một buổi chiều vui vẻ!`;
            }
            if (timeCurrent.hour >= 17 && timeCurrent.hour <= 18) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nBạn đã ăn tối chưa nhỉ?`;
            }
            if (timeCurrent.hour >= 19 && timeCurrent.hour <= 21) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nChúc bạn một buổi tối vui vẻ!`;
            }
            if (timeCurrent.hour >= 22 && timeCurrent.hour <= 23) {
                return `Xin chào ${userInformation.name}!\nBây giờ là ${timeCurrent.dateTime}\nBạn đã chuẩn bị đi ngủ chưa, bạn nên đi ngủ sớm để có một giấc ngủ ngon nhé!`;
            }
        }
    }

    private async toggleBot(senderPsid: string, userInformation: UserInformation) {
        const isBotOff: boolean = this.listOffBan.has(senderPsid);
        const quickReply: QuickReply = {
            payload: 'TOGGLE_BOT',
            title: isBotOff ? '🟢Bật bot' : '🔴Tắt bot',
            content_type: 'text',
        };
        const message = `Bot hiện tại đã ${isBotOff ? 'tắt' : 'bật'}\nBạn có muốn ${
            isBotOff ? 'bật' : 'tắt'
        } bot không?`;
        await this.messengerBot.sendQuickReply(senderPsid, message, [quickReply]);
    }

    private async buyAllFonts(senderPsid: string, userInformation: UserInformation) {
        const message = `Hiện tại mình đang giảm giá bộ 600 font \n\nDùng cho cá nhân: 300k\n\n Dùng cho doanh nghiệp: 500k\n\nBạn có muốn mua không?`;
        await this.messengerBot.sendTextMessage(senderPsid, message);
        await this.contact(senderPsid, userInformation);
    }

    private async contact(senderPsid: string, userInformation: UserInformation) {
        const message = `${userInformation.name} có thể liên hệ với admin qua các kênh sau:\nFacebook: m.me/nam077.me\n\nZalo: 0337994575\n\nEmail:nam077.me@gmail.com\n\nSố điện thoại: 0337994575`;
        await this.messengerBot.sendTextMessage(senderPsid, message);
    }

    private async viewPrice(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewGuide(senderPsid: string, userInformation: UserInformation) {
        return Promise.resolve(undefined);
    }

    private async viewListFontsText(senderPsid: string, userInformation: UserInformation) {
        const fontTexts: string[][] = await this.chatService.getFontChunkString();
        await this.sendListFontsText(senderPsid, userInformation, fontTexts);
    }
    private async sendListFontsText(senderPsid: string, userInformation: UserInformation, fontTexts: string[][]) {
        for (const fontText of fontTexts) {
            await this.messengerBot.sendTextMessage(senderPsid, fontText.join('\n\n'));
        }
        const message = 'Để tải font bạn hãy chọn một font và gửi tên font đó cho admin nhé!';
        await this.messengerBot.sendTextMessage(senderPsid, message);
        await this.messengerBot.sendTextMessage(
            senderPsid,
            `Ví dụ bạn muốn tải font ${fontTexts[0][0] || 'NVN Parka'} thì bạn hãy gửi tin nhắn\n\n"Mình cần tải font ${
                fontTexts[0][0] || 'NVN Parka'
            }"`,
        );
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

    private async sendQuickReplyStart(senderPsid: string) {
        const quickReplies: QuickReply[] = [
            {
                content_type: 'text',
                title: '🔥 Xem các font mới nhất',
                payload: 'VIEW_NEW_FONTS',
            },
            {
                content_type: 'text',
                title: '📜 Danh sách các font',
                payload: 'VIEW_ALL_FONTS',
            },
            {
                content_type: 'text',
                title: '📜 Xem demo danh sách font',
                payload: 'VIEW_DEMO_FONTS',
            },
            {
                content_type: 'text',
                title: '📖 Hướng dẫn sử dụng',
                payload: 'VIEW_GUIDE',
            },
            {
                content_type: 'text',
                title: '💰 Xem giá việt hóa',
                payload: 'VIEW_PRICE',
            },
            {
                content_type: 'text',
                title: '📞 Liên hệ',
                payload: 'CONTACT',
            },
        ];
        return this.messengerBot.sendQuickReply(senderPsid, 'Bạn muốn làm gì?', quickReplies);
    }
}
