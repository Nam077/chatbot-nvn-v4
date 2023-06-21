import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { MessengerModule } from './modules/messenger/messenger.module';
import { SettingModule } from './modules/setting/setting.module';
import { ChatModule } from './modules/chat/chat.module';
import { FontModule } from './modules/font/font.module';
import { ResponseModule } from './modules/response/response.module';
import { KeyModule } from './modules/key/key.module';
import { ImageModule } from './modules/image/image.module';
import { LinkModule } from './modules/link/link.module';
import { BanModule } from './modules/ban/ban.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessageModule } from './modules/message/message.module';
import { TagModule } from './modules/tag/tag.module';
import { FontChunkModule } from './modules/font-chunk/font-chunk.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        CacheModule.register({ isGlobal: true }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        DatabaseModule,
        UserModule,
        MessengerModule,
        SettingModule,
        ChatModule,
        FontModule,
        ResponseModule,
        KeyModule,
        ImageModule,
        LinkModule,
        BanModule,
        AdminModule,
        MessageModule,
        TagModule,
        FontChunkModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
