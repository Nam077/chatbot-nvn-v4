import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GoogleSheetService } from './google-sheet/google-sheet.service';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from '../key/key.module';
import { MessageModule } from '../message/message.module';
import { LinkModule } from '../link/link.module';
import { FontModule } from '../font/font.module';
import { ResponseModule } from '../response/response.module';
import { TagModule } from '../tag/tag.module';
import { ImageModule } from '../image/image.module';
import { CrawlerService } from './crawler/crawler.service';
import { HttpModule } from '@nestjs/axios';
import { BanModule } from '../ban/ban.module';
import { SettingModule } from '../setting/setting.module';
import { AdminModule } from '../admin/admin.module';
import { FoodModule } from '../food/food.module';
import { FontGlobalModule } from '../font-global/font-global.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        KeyModule,
        MessageModule,
        LinkModule,
        FontModule,
        ResponseModule,
        TagModule,
        ImageModule,
        HttpModule,
        BanModule,
        SettingModule,
        AdminModule,
        FoodModule,
        FontGlobalModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, GoogleSheetService, CrawlerService],
    exports: [ChatService],
})
export class ChatModule {}
