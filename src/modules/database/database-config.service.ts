import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Setting } from '../setting/entities/setting.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Ban } from '../ban/entities/ban.entity';
import { Font } from '../font/entities/font.entity';
import { Key } from '../key/entities/key.entity';
import { Response } from '../response/entities/response.entity';
import { Link } from '../link/entities/link.entity';
import { Message } from '../message/entities/message.entity';
import { Image } from '../image/entities/image.entity';
import { Tag } from '../tag/entities/tag.entity';
import { FontChunk } from '../font-chunk/entities/font-chunk.entity';
import { Food } from '../food/entities/food.entity';
import { FutureGlobal } from '../future-global/entities/future-global.entity';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'better-sqlite3',
            database: this.configService.get<string>('DB_NAME'),
            entities: [
                User,
                Setting,
                Admin,
                Ban,
                Font,
                Key,
                Response,
                Link,
                Message,
                Image,
                Tag,
                FontChunk,
                Food,
                FutureGlobal,
            ],
            synchronize: true,
            autoLoadEntities: true,
            // logging: true,
        };
    }
}
