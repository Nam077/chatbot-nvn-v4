import { Module } from '@nestjs/common';
import { DatabaseConfigService } from './database-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DatabaseConfigService,
            inject: [ConfigService],
        }),
    ],
    providers: [DatabaseConfigService],
})
export class DatabaseModule {}
