import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('chat')
@ApiTags('Chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('/test')
    test() {
        return this.chatService.updateDataFromGoogleSheet();
    }
}
