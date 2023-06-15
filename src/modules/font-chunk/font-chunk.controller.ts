import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FontChunkService } from './font-chunk.service';
import { CreateFontChunkDto } from './dto/create-font-chunk.dto';
import { UpdateFontChunkDto } from './dto/update-font-chunk.dto';

@Controller('font-chunk')
export class FontChunkController {
  constructor(private readonly fontChunkService: FontChunkService) {}

  @Post()
  create(@Body() createFontChunkDto: CreateFontChunkDto) {
    return this.fontChunkService.create(createFontChunkDto);
  }

  @Get()
  findAll() {
    return this.fontChunkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fontChunkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFontChunkDto: UpdateFontChunkDto) {
    return this.fontChunkService.update(+id, updateFontChunkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fontChunkService.remove(+id);
  }
}
