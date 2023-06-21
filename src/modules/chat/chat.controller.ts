import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('chat')
@ApiTags('Chat')
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
