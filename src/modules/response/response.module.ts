import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';
import { ResponseController } from './response.controller';
import { Response } from './entities/response.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyModule } from '../key/key.module';
import { ImageModule } from '../image/image.module';
import { MessageModule } from '../message/message.module';
import { LinkModule } from '../link/link.module';
import { TagModule } from '../tag/tag.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Response], 'chat-bot'),
        KeyModule,
        ImageModule,
        MessageModule,
        LinkModule,
        TagModule,
    ],
    controllers: [ResponseController],
    providers: [ResponseService],
    exports: [ResponseService],
})
export class ResponseModule {}
