import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('message')
@ApiTags('Message')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    @ApiOperation({ summary: 'Create message' })
    create(@Body() createMessageDto: CreateMessageDto) {
        return this.messageService.create(createMessageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all messages' })
    findAll() {
        return this.messageService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get message by id' })
    findOne(@Param('id') id: string) {
        return this.messageService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate message by id' })
    update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
        return this.messageService.update(+id, updateMessageDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete message by id' })
    remove(@Param('id') id: string) {
        return this.messageService.remove(+id);
    }
}
