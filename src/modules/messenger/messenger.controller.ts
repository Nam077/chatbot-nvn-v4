import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../../decorators/auth/is-public.decorator';

@Controller('messenger')
@ApiTags('Messenger')
@ApiBearerAuth()
@IsPublic()
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
