import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BanService } from './ban.service';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('ban')
@ApiBearerAuth()
@ApiTags('Ban')
@UseGuards(RoleGuard)
export class BanController {
    constructor(private readonly banService: BanService) {}

    @Post()
    @ApiOperation({ summary: 'Create ban' })
    create(@Body() createBanDto: CreateBanDto) {
        return this.banService.create(createBanDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all bans' })
    findAll() {
        return this.banService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get ban by id' })
    findOne(@Param('id') id: string) {
        return this.banService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update ban by id' })
    update(@Param('id') id: string, @Body() updateBanDto: UpdateBanDto) {
        return this.banService.update(+id, updateBanDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete ban by id' })
    remove(@Param('id') id: string) {
        return this.banService.remove(+id);
    }
}
