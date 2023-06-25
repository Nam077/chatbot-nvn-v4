import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../../decorators/auth/is-public.decorator';

@Controller('messenger')
@ApiTags('Messenger')
@ApiBearerAuth()
export class MessengerController {
    constructor(private readonly messengerService: MessengerService) {}
    @Get('/webhook')
    @IsPublic()
    @ApiOperation({ summary: 'Setup webhook' })
    getWebHook(
        @Query('hub.mode') mode: string,
        @Query('hub.challenge') challenge: string,
        @Query('hub.verify_token') verifyToken: string,
    ) {
        return this.messengerService.getWebHook(mode, challenge, verifyToken);
    }

    @Post('/webhook')
    @IsPublic()
    @ApiOperation({ summary: 'Setup webhook' })
    postWebHook(@Body() body) {
        return this.messengerService.postWebHook(body);
    }
    @Get('/set-up-persistent-menu')
    @ApiOperation({ summary: 'Setup persistent menu' })
    @IsPublic()
    setUpPersistentMenu() {
        return this.messengerService.setUpPersistentMenu();
    }
    @Get('/set-up-get-started-button')
    @ApiOperation({ summary: 'Setup get started button' })
    setUpGetStartedButton() {
        return this.messengerService.setUpGetStartedButton();
    }

    @Get('/update-page-access-token')
    @ApiOperation({ summary: 'Update page access token' })
    updatePageAccessToken(@Query('token') token: string) {
        return this.messengerService.updatePageAccessToken(token);
    }
}
