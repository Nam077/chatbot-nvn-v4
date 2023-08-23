import { Module } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';
import { TelegrafConfigService } from './telegraf-config-service';
import { SettingService } from '../setting/setting.service';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            imports: [SettingModule],
            useClass: TelegrafConfigService,
            inject: [SettingService],
        }),
    ],
})
export class TelegrafBotModule {}
