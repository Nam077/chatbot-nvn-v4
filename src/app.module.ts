import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { MessengerModule } from './modules/messenger/messenger.module';
import { SettingModule } from './modules/setting/setting.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        DatabaseModule,
        UserModule,
        MessengerModule,
        SettingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
