import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('link')
@ApiTags('Link')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @Post()
    @ApiOperation({ summary: 'Create link' })
    create(@Body() createLinkDto: CreateLinkDto) {
        return this.linkService.create(createLinkDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all links' })
    findAll() {
        return this.linkService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get link by id' })
    findOne(@Param('id') id: string) {
        return this.linkService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate link by id' })
    update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
        return this.linkService.update(+id, updateLinkDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete link by id' })
    remove(@Param('id') id: string) {
        return this.linkService.remove(+id);
    }
}
