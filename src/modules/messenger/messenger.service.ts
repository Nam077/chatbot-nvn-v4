import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotMessenger, CallToAction, Element, PersistentMenu, UserInformation } from './models/bot-messenger';
import { getTimeCurrent, TimeCurrent } from '../../utils/time';
import { ChatService } from '../chat/chat.service';
import { Button, QuickReply } from '../../common/bot';
import { CrawDataYoutube } from '../chat/crawler/crawler.service';
import { Font } from '../font/entities/font.entity';

export const INTENT_START = ['bắt đầu', 'start', 'restart', 'restart bot', 'khởi động lại', 'khởi động lại'];
export const COMMANDS_ADMIN = ['@ban', '@unban', '@multiple', '@bot', '@admin', '@token', '@update'];
export type TYPE_BUTTON_FONTS = 'postback' | 'web_url';
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
    TOGGLE_BOT_ON = 'TOGGLE_BOT_ON',
    TOGGLE_BOT_OFF = 'TOGGLE_BOT_OFF',
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
            payload: `TOGGLE_BOT_${isBotOff ? 'ON' : 'OFF'}`,
            title: isBotOff ? '🟢Bật bot' : '🔴Tắt bot',
            content_type: 'text',
        };
        const message = `Bot hiện tại đã ${isBotOff ? 'tắt' : 'bật'}\n${userInformation.name} có muốn ${
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
        const message = `Hiện tại bên mình đang nhận việt hoá font với giá như sau:\n\nFont có số lượng weight < 10: 70.000đ - 100.000đ \n\nFont có số lượng weight >= 10: 60.000đ - 100.000đ\n\nFont có số lượng weight >= 20: 50.000đ - 100.000đ\n\nFont có số lượng weight >= 30: 40.000đ - 100.000đ\n\nFont có số lượng weight >= 40: 30.000đ - 100.000đ\n\nFont có số lượng weight >= 50: 20.000đ - 100.000đ\n\nFont có số lượng weight >= 60: 10.000đ - 100.000đ\n\nFont có số lượng weight >= 70: 5.000đ - 100.000đ\n\nFont có số lượng weight >= 80: 1.000đ - 100.000đ\n\nFont có số lượng weight >= 90: 500đ - 100.000đ\n\nFont có số lượng weight >= 100: 100đ - 100.000đ\n\nNếu ${userInformation.name} có nhu cầu việt hoá font`;
        await this.messengerBot.sendTextMessage(senderPsid, message);
        await this.contact(senderPsid, userInformation);
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
        const fonts: Font[][] = await this.chatService.getFontChunk();
        await this.sendNewFonts(senderPsid, userInformation, fonts);
    }
    private async sendNewFonts(senderPsid: string, userInformation: UserInformation, fonts: Font[][]) {
        const newFonts: Font[] = fonts[fonts.length - 1];
        await this.sendListFontGeneric(senderPsid, userInformation, newFonts);
    }

    private async sendListFontGeneric(
        senderPsid: string,
        userInformation: UserInformation,
        fonts: Font[],
        type: TYPE_BUTTON_FONTS = 'postback',
    ) {
        const elements: Element[] = fonts.map((font) => {
            return {
                title: font.name,
                image_url:
                    font.images[Math.floor(Math.random() * font.images.length)].url ||
                    'https://i.ibb.co/HB5YtcD/242064584-376039017519810-9165860114478955115-n.jpg',
                default_action: {
                    type: 'web_url',
                    url: font.urlPost,
                    webview_height_ratio: 'tall',
                },
                buttons: type === 'postback' ? this.getButtonPostbackFont(font) : this.getButtonUrlFont(font),
            };
        });
        await this.messengerBot.sendGenericMessage(senderPsid, elements);
    }
    getButtonPostbackFont(font: Font): Button[] {
        return [
            {
                payload: font.keys ? font.keys[Math.floor(Math.random() * font.keys.length)].value : font.name,
                title: 'Tải font',
                type: 'postback',
            },
        ];
    }
    getButtonUrlFont(font: Font): Button[] {
        const buttons: Button[] = [];
        for (let i = 0; i < font.links.length && i < 3; i++) {
            buttons.push({
                type: 'web_url',
                url: font.links[i].url,
                title: 'Link ' + (i + 1),
            });
        }
        return buttons;
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
    private async viewGuide(senderPsid: string, userInformation: UserInformation) {
        const string =
            `Chào ${userInformation.name}!\n` +
            `Tôi là bot hỗ trợ tải font chữ miễn phí\n` +
            `-------------------------\n` +
            `Bạn có thể tìm kiếm font chữ theo tên hoặc tải font chữ theo tên\n` +
            `Ví dụ: Tôi muốn tải font <tên font>\n` +
            `-------------------------\n` +
            `Bạn có thể tìm kiếm video theo tên\n` +
            `@ytb <tên video>\n` +
            `Ví dụ: @ytb Âm thầm bên em\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi kết quả xổ số\n` +
            `Ví dụ: @xsmb\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi thông tin covid\n` +
            `@covid <tên quốc gia>\n` +
            `Ví dụ: @covid Việt Nam\n` +
            `-------------------------\n` +
            `Bạn có thể lấy số may mắn\n` +
            `@lucky min=<số nhỏ nhất> max=<số lớn nhất>\n get=<số lượng số>\n` +
            `Ví dụ: @lucky min=1 max=100 get=5\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi bot ăn gì hôm nay\n` +
            `Ví dụ: Hôm nay ăn gì\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi thời tiết theo địa điểm\n` +
            `Ví dụ: Thời tiết <địa điểm>\n` +
            `Ví dụ: Thời tiết Hà Nội\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi thông tin cơ bản\n` +
            `Ví dụ: Tại sao lá cây lại có màu xanh ?\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi tỷ số bóng đá\n` +
            `Ví dụ: Tỷ số bóng đá Việt Nam - Thái Lan\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi ngày sinh ngày lễ, và nhiều thứ khác\n` +
            `Ví dụ: Ngày sinh của Ronaldo\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi giá vật giá, tiền, bitcoin\n` +
            `Ví dụ: Giá bitcoin\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi định nghĩa\n` +
            `Ví dụ: Định nghĩa của tình yêu\n` +
            `-------------------------\n` +
            `Bạn có thể chuyển đổi đơn vị\n` +
            `Ví dụ: 3 tấn bằng bao nhiêu kg\n` +
            `-------------------------\n` +
            `Bạn có thể chuyển đổi tiền tệ\n` +
            `Ví dụ: 3000 $ bằng bao nhiêu đồng\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi lyric bài hát\n` +
            `Lyric  <tên bài hát>\n` +
            `Ví dụ: Lyric Có hẹn với thanh xuân\n` +
            `-------------------------\n` +
            `Bạn có thể hỏi kiến thức lịch sử, địa lý và vô vàn chủ đề khác\n` +
            `Ví dụ: Chiến dịch Điện Biên Phủ ngày tháng năm nào ?\n` +
            `Ví dụ: Địa lý Việt Nam có bao nhiêu tỉnh ?\n` +
            `-------------------------\n`;
        return await this.messengerBot.sendTextMessage(senderPsid, string);
    }
}
