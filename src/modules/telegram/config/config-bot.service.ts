import { Injectable } from '@nestjs/common';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { SettingService } from '../../setting/setting.service';
import { sessionMiddleware } from '../../../middlewares/session.middleware';

@Injectable()
export class ConfigBotService implements TelegrafOptionsFactory {
    constructor(private readonly settingService: SettingService) {}
    async createTelegrafOptions(): Promise<TelegrafModuleOptions> {
        return {
            token: await this.settingService.getTelegramBotToken(),
            botName: 'NVNChatBot',
            middlewares: [sessionMiddleware],
        };
    }
}
