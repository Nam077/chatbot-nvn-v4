import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { SettingService } from '../setting/setting.service';
import { Inject } from '@nestjs/common';

export class TelegrafConfigService implements TelegrafOptionsFactory {
    constructor(private readonly settingService: SettingService) {
        console.log('SettingService:', this.settingService);
    }
    async createTelegrafOptions(): Promise<TelegrafModuleOptions> {
        return {
            token: await this.settingService.getTelegramBotToken(),
        };
    }
}
