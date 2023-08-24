import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('image')
@ApiTags('Image')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @Post()
    @ApiOperation({ summary: 'Create image' })
    create(@Body() createImageDto: CreateImageDto) {
        return this.imageService.create(createImageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all images' })
    findAll() {
        return this.imageService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get image by id' })
    findOne(@Param('id') id: string) {
        return this.imageService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'BotUpdate image by id' })
    update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
        return this.imageService.update(+id, updateImageDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete image by id' })
    remove(@Param('id') id: string) {
        return this.imageService.remove(+id);
    }
}
