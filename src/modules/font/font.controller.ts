import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FontService } from './font.service';
import { CreateFontDto } from './dto/create-font.dto';
import { UpdateFontDto } from './dto/update-font.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('font')
@ApiTags('Font')
export class FontController {
    constructor(private readonly fontService: FontService) {}

    @Post()
    create(@Body() createFontDto: CreateFontDto) {
        return this.fontService.create(createFontDto);
    }

    @Get()
    findAll() {
        return this.fontService.findAll();
    }

    @Get('test')
    test() {
        return this.fontService.findChunkGetString();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fontService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFontDto: UpdateFontDto) {
        return this.fontService.update(+id, updateFontDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fontService.remove(+id);
    }
}
