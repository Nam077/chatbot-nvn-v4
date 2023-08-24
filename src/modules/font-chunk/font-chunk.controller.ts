import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FontChunkService } from './font-chunk.service';
import { CreateFontChunkDto } from './dto/create-font-chunk.dto';
import { UpdateFontChunkDto } from './dto/update-font-chunk.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('font-chunk')
@ApiTags('FontChunk')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class FontChunkController {
    constructor(private readonly fontChunkService: FontChunkService) {}

    @Post()
    @ApiOperation({ summary: 'Create font-chunk' })
    create(@Body() createFontChunkDto: CreateFontChunkDto) {
        return this.fontChunkService.create(createFontChunkDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all font-chunks' })
    findAll() {
        return this.fontChunkService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get font-chunk by id' })
    findOne(@Param('id') id: string) {
        return this.fontChunkService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate font-chunk by id' })
    update(@Param('id') id: string, @Body() updateFontChunkDto: UpdateFontChunkDto) {
        return this.fontChunkService.update(+id, updateFontChunkDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete font-chunk by id' })
    remove(@Param('id') id: string) {
        return this.fontChunkService.remove(+id);
    }
}
