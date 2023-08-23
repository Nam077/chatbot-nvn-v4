import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { SettingService } from '../setting/setting.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegrafConfigService implements TelegrafOptionsFactory {
    constructor(private readonly settingService: SettingService) {
        console.log('SettingService:', this.settingService);
    }
    async createTelegrafOptions(): Promise<TelegrafModuleOptions> {
        return {
            token: (await this.settingService.getTelegramBotToken()) as string,
        };
    }
}
