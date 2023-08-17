import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FutureGlobalService } from './future-global.service';
import { CreateFutureGlobalDto } from './dto/create-future-global.dto';
import { UpdateFutureGlobalDto } from './dto/update-future-global.dto';

@Controller('future-global')
export class FutureGlobalController {
    constructor(private readonly futureGlobalService: FutureGlobalService) {}

    @Post()
    create(@Body() createFutureGlobalDto: CreateFutureGlobalDto) {
        return this.futureGlobalService.create(createFutureGlobalDto);
    }

    @Get()
    findAll() {
        return this.futureGlobalService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.futureGlobalService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFutureGlobalDto: UpdateFutureGlobalDto) {
        return this.futureGlobalService.update(+id, updateFutureGlobalDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.futureGlobalService.remove(+id);
    }
}
