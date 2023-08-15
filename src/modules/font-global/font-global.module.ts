import { Module } from '@nestjs/common';
import { FontGlobalService } from './font-global.service';
import { FontGlobalController } from './font-global.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FontGlobal } from './entities/font-global.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FontGlobal], 'font-global')],
    controllers: [FontGlobalController],
    providers: [FontGlobalService],
    exports: [FontGlobalService],
})
export class FontGlobalModule {}
