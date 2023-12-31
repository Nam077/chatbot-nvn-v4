import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('setting')
@ApiTags('Setting')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class SettingController {
    constructor(private readonly settingService: SettingService) {}

    @Post()
    @ApiOperation({ summary: 'Create setting' })
    create(@Body() createSettingDto: CreateSettingDto) {
        return this.settingService.create(createSettingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all settings' })
    findAll() {
        return this.settingService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get setting by id' })
    findOne(@Param('id') id: string) {
        return this.settingService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate setting by id' })
    update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
        return this.settingService.update(+id, updateSettingDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete setting by id' })
    remove(@Param('id') id: string) {
        return this.settingService.remove(+id);
    }
}
