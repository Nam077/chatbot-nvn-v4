import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { KeyService } from './key.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('key')
@ApiTags('Key')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class KeyController {
    constructor(private readonly keyService: KeyService) {}

    @Post()
    @ApiOperation({ summary: 'Create key' })
    create(@Body() createKeyDto: CreateKeyDto) {
        return this.keyService.create(createKeyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all keys' })
    findAll() {
        return this.keyService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get key by id' })
    findOne(@Param('id') id: string) {
        return this.keyService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate key by id' })
    update(@Param('id') id: string, @Body() updateKeyDto: UpdateKeyDto) {
        return this.keyService.update(+id, updateKeyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete key by id' })
    remove(@Param('id') id: string) {
        return this.keyService.remove(+id);
    }
}
