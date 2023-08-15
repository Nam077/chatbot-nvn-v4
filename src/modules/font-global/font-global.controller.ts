import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FontGlobalService } from './font-global.service';
import { CreateFontGlobalDto } from './dto/create-font-global.dto';
import { UpdateFontGlobalDto } from './dto/update-font-global.dto';
import { IsPublic } from '../../decorators/auth/is-public.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('font-global') // http://localhost:3000/font-global
@ApiTags('FontGlobal')
export class FontGlobalController {
    constructor(private readonly fontGlobalService: FontGlobalService) {}

    @Post()
    create(@Body() createFontGlobalDto: CreateFontGlobalDto) {
        return this.fontGlobalService.create(createFontGlobalDto);
    }

    @Get()
    @IsPublic()
    findAll() {
        return this.fontGlobalService.findAll();
    }

    @Get('latest')
    @IsPublic()
    getFontLatest() {
        return this.fontGlobalService.getFontLatest();
    }

    @Get('random')
    @IsPublic()
    getRandomFonts(@Query('limit') limit: number) {
        return this.fontGlobalService.getRandomFonts(limit);
    }
    @Get('search/:keyword')
    @IsPublic()
    search(@Param('keyword') keyword: string) {
        return this.fontGlobalService.search(keyword);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fontGlobalService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFontGlobalDto: UpdateFontGlobalDto) {
        return this.fontGlobalService.update(+id, updateFontGlobalDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fontGlobalService.remove(+id);
    }
}
