import { Injectable } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';

@Injectable()
export class KeyService {
  create(createKeyDto: CreateKeyDto) {
    return 'This action adds a new key';
  }

  findAll() {
    return `This action returns all key`;
  }

  findOne(id: number) {
    return `This action returns a #${id} key`;
  }

  update(id: number, updateKeyDto: UpdateKeyDto) {
    return `This action updates a #${id} key`;
  }

  remove(id: number) {
    return `This action removes a #${id} key`;
  }
}
