import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('chat')
@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('/test')
    test(@Query('key') key: string) {
        return this.chatService.getFontChunk();
    }

    @Get('/test2')
    test2(@Query('key') key: string) {
        return 'test2';
    }
}
