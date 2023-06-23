import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('response')
@ApiTags('Response')
@ApiBearerAuth()
@UseGuards(RoleGuard)
export class ResponseController {
    constructor(private readonly responseService: ResponseService) {}

    @Post()
    @ApiOperation({ summary: 'Create response' })
    create(@Body() createResponseDto: CreateResponseDto) {
        return this.responseService.create(createResponseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all responses' })
    findAll() {
        return this.responseService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get response by id' })
    findOne(@Param('id') id: string) {
        return this.responseService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update response by id' })
    update(@Param('id') id: string, @Body() updateResponseDto: UpdateResponseDto) {
        return this.responseService.update(+id, updateResponseDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete response by id' })
    remove(@Param('id') id: string) {
        return this.responseService.remove(+id);
    }
}
