import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { SettingModule } from '../setting/setting.module';
import { ConfigBotService } from './config/config-bot.service';
import { SettingService } from '../setting/setting.service';
import { BotUpdate } from './bot.update';
import { FontWizard } from './wizards/font.wizard';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            imports: [SettingModule],
            useClass: ConfigBotService,
            inject: [SettingService],
        }),
    ],
    providers: [BotUpdate, FontWizard],
})
export class TelegramModule {}
