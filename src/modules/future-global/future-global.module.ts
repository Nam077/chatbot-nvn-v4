import { Module } from '@nestjs/common';
import { FutureGlobalService } from './future-global.service';
import { FutureGlobalController } from './future-global.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FutureGlobal } from './entities/future-global.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FutureGlobal], 'chat-bot')],
    controllers: [FutureGlobalController],
    providers: [FutureGlobalService],
    exports: [FutureGlobalService],
})
export class FutureGlobalModule {}
