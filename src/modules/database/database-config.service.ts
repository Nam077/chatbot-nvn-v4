import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'better-sqlite3',
            database: this.configService.get<string>('DB_NAME'),
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            synchronize: true,
            autoLoadEntities: true,
        };
    }
}
