import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { MessengerBot } from '../../common/messenger-bot';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [MessengerController],
    providers: [MessengerService, MessengerBot],
})
export class MessengerModule {}
