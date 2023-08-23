import { TelegrafConfigService } from './telegraf-config-service';
import { TelegrafModule } from 'nestjs-telegraf';
import { Module } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';
import { SettingService } from '../setting/setting.service';
import { AppUpdate } from './app-update';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            imports: [SettingModule],
            useClass: TelegrafConfigService,
            inject: [SettingService],
        }),
    ],
    providers: [AppUpdate],
})
export class TelegrafBotModule {}
