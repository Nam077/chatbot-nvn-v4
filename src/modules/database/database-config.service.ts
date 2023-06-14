import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Setting } from '../setting/entities/setting.entity';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'better-sqlite3',
            database: this.configService.get<string>('DB_NAME'),
            entities: [User, Setting],
            synchronize: true,
            autoLoadEntities: true,
            // logging: true,
        };
    }
}
