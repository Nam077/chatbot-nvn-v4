import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { UpdateKeyDto } from './dto/update-key.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Key } from './entities/key.entity';
import { removeAllSpecialCharacters, removeExtraSpaces } from '../../utils/string';

export type TypeCreate = 'font' | 'response';

@Injectable()
export class KeyService {
    constructor(
        @InjectRepository(Key)
        private readonly keyRepository: Repository<Key>,
    ) {}

    async findKeyByValue(value: string): Promise<Key> {
        return this.keyRepository.findOneBy({ value });
    }

    async checkExistByValue(value: string, id?: number): Promise<boolean> {
        const Key = await this.findKeyByValue(value);
        if (!Key) {
            return false;
        }
        if (id) {
            return Key.id !== id;
        }
        return true;
    }

    async create(createKeyDto: CreateKeyDto) {
        const { name } = createKeyDto;
        createKeyDto.value
            ? removeAllSpecialCharacters(removeExtraSpaces(createKeyDto.value))
            : removeAllSpecialCharacters(removeExtraSpaces(createKeyDto.name));
        if (await this.checkExistByValue(createKeyDto.value)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Key already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        return await this.keyRepository.save(createKeyDto);
    }

    async findAll() {
        return await this.keyRepository.find();
    }

    async findOne(id: number) {
        return this.keyRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateKeyDto: UpdateKeyDto) {
        const { name } = updateKeyDto;
        if (updateKeyDto.value) {
            updateKeyDto.value = removeAllSpecialCharacters(removeExtraSpaces(updateKeyDto.value));
            if (await this.checkExistByValue(updateKeyDto.value, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Key already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        await this.keyRepository.update(id, updateKeyDto);
        return await this.findOne(id);
    }

    async remove(id: number) {
        const key = await this.findOne(id);
        if (!key) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Key not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.keyRepository.delete(id);
    }

    async createMultiple(keys: CreateKeyDto[], deleteOld = false): Promise<Record<string, Key>> {
        if (deleteOld) {
            await this.keyRepository.clear();
        }
        const results = await this.keyRepository.save(keys);
        return results.reduce((acc, key) => {
            acc[key.value] = key;
            return acc;
        }, {});
    }

    async findKeysByValues(values: string[]): Promise<Record<string, Key>> {
        const keys = await this.keyRepository.find({
            where: {
                value: In(values),
            },
            relations: {
                font: true,
                response: true,
            },
            select: {
                font: {
                    id: true,
                },
                response: {
                    id: true,
                },
            },
        });
        return keys.reduce((acc, key) => {
            acc[key.value] = key;
            return acc;
        }, {});
    }

    async findOrCreateMultipleKeys(
        values: string[],
        type: TypeCreate,
        idFont?: number,
        idResponse?: number,
        chunk = 200,
    ): Promise<Key[]> {
        const cleanedValues = values.map((value) => removeAllSpecialCharacters(removeExtraSpaces(value)));
        const existsKeys = await this.findKeysByValues(cleanedValues);
        const newKeys: string[] = cleanedValues.filter((value) => !existsKeys[value]);
        const createdKeys = await Promise.all(
            newKeys.map((value) =>
                this.keyRepository.save(
                    { value, name: value },
                    {
                        chunk,
                    },
                ),
            ),
        );
        const returnKeys = [...createdKeys];
        const existsKeysValues = Object.keys(existsKeys);
        if (type === 'font') {
            existsKeysValues.forEach((value) => {
                const key = existsKeys[value];
                if (!key.font || (idFont && key.font.id === idFont)) {
                    returnKeys.push(key);
                }
            });
        }
        if (type === 'response') {
            existsKeysValues.forEach((value) => {
                const key = existsKeys[value];
                if (!key.response || (idResponse && key.response.id === idResponse)) {
                    returnKeys.push(key);
                }
            });
        }
        return returnKeys;
    }
}
