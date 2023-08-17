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
import { AuthModule } from './modules/auth/auth.module';
import { AtGuard } from './modules/auth/guards/at-guard.service';
import { APP_GUARD } from '@nestjs/core';
import { FoodModule } from './modules/food/food.module';
import { FontGlobalModule } from './modules/font-global/font-global.module';
import { FutureGlobalModule } from './modules/future-global/future-global.module';

@Module({
    imports: [
        CacheModule.register({ isGlobal: true }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        DatabaseModule,
        AuthModule,
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
        FoodModule,
        FontGlobalModule,
        FutureGlobalModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AtGuard,
        },
    ],
})
export class AppModule {}
