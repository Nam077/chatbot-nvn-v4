import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { ConfigModule } from '@nestjs/config';
import { SettingService } from '../setting/setting.service';
import { SettingModule } from '../setting/setting.module';
import { BotMessenger } from './models/bot-messenger';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
    imports: [ConfigModule.forRoot(), SettingModule, HttpModule],
    controllers: [MessengerController],
    providers: [
        {
            provide: BotMessenger,
            useFactory: async (settingService: SettingService) => {
                const pageAccessToken = await settingService.getPageAccessTokens();
                const apiVersion = await settingService.getApiVersion('v10.0');
                return new BotMessenger(
                    {
                        pageAccessToken,
                        apiVersion,
                    },
                    new HttpService(),
                );
            },
            inject: [SettingService, HttpService],
        },
        MessengerService,
    ],
})
export class MessengerModule {}
