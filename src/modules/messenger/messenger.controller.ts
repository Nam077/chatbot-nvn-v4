import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('messenger')
export class MessengerController {
    constructor(private readonly messengerService: MessengerService) {}
    @Get('/webhook')
    @ApiOperation({ summary: 'Setup webhook' })
    getWebHook(
        @Query('hub.mode') mode: string,
        @Query('hub.challenge') challenge: string,
        @Query('hub.verify_token') verifyToken: string,
    ) {
        return this.messengerService.getWebHook(mode, challenge, verifyToken);
    }

    @Post('/webhook')
    @ApiOperation({ summary: 'Setup webhook' })
    postWebHook(@Body() body) {
        return this.messengerService.postWebHook(body);
    }
}
