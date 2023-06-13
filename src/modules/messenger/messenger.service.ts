import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessengerBot } from '../../common/messenger-bot';

@Injectable()
export class MessengerService {
    constructor(private readonly configService: ConfigService, private readonly messengerBot: MessengerBot) {
        this.messengerBot.pageAccessToken = this.configService.get<string>('MESSENGER_PAGE_ACCESS_TOKEN');
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
            entry.forEach((entry) => {
                const webhookEvent = entry.messaging[0];
                console.log(webhookEvent);
                const senderPsid = webhookEvent.sender.id;
                if (webhookEvent.message) {
                    this.handleMessage(senderPsid, webhookEvent.message);
                } else if (webhookEvent.postback) {
                }
            });
        }
        return 'EVENT_RECEIVED';
    }

    private async handleMessage(senderPsid: any, message) {
        console.log(this.messengerBot.pageAccessToken);
        await this.messengerBot.sendMessage(senderPsid, message.text);
    }
}
