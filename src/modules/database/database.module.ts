import { Module } from '@nestjs/common';
import { DatabaseConfigService } from './database-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfigGlobalService } from './database-config-global.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            name: 'chat-bot',
            imports: [ConfigModule],
            useClass: DatabaseConfigService,
            inject: [ConfigService],
        }),
        TypeOrmModule.forRootAsync({
            name: 'font-global',
            imports: [ConfigModule],
            useClass: DatabaseConfigGlobalService,
            inject: [ConfigService],
        }),
    ],
    providers: [DatabaseConfigService],
})
export class DatabaseModule {}
