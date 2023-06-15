import { Injectable } from '@nestjs/common';
import { CreateFontChunkDto } from './dto/create-font-chunk.dto';
import { UpdateFontChunkDto } from './dto/update-font-chunk.dto';

@Injectable()
export class FontChunkService {
  create(createFontChunkDto: CreateFontChunkDto) {
    return 'This action adds a new fontChunk';
  }

  findAll() {
    return `This action returns all fontChunk`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fontChunk`;
  }

  update(id: number, updateFontChunkDto: UpdateFontChunkDto) {
    return `This action updates a #${id} fontChunk`;
  }

  remove(id: number) {
    return `This action removes a #${id} fontChunk`;
  }
}
