import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}

    async findTagByName(name: string): Promise<Tag> {
        return this.tagRepository.findOneBy({ name });
    }

    async checkExistByName(name: string, id?: number): Promise<boolean> {
        const tag = await this.findTagByName(name);
        if (!tag) {
            return false;
        }
        if (id) {
            return tag.id !== id;
        }
        return true;
    }

    async create(createTagDto: CreateTagDto) {
        const { name } = createTagDto;
        if (await this.checkExistByName(name)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Tag already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        return await this.tagRepository.save(createTagDto);
    }

    async findAll() {
        return await this.tagRepository.find();
    }

    async findOne(id: number) {
        return this.tagRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateTagDto: UpdateTagDto) {
        const { name } = updateTagDto;
        if (updateTagDto.name) {
            if (await this.checkExistByName(name, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Tag already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        return await this.tagRepository.update(id, updateTagDto);
    }

    async remove(id: number) {
        const tag = await this.findOne(id);
        if (!tag) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Tag not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return await this.tagRepository.delete(id);
    }

    async createMultiple(tags: CreateTagDto[], deleteOld = false): Promise<Record<string, Tag>> {
        if (deleteOld) {
            await this.tagRepository.clear();
        }
        const results = await this.tagRepository.save(tags);
        return results.reduce((acc, tag) => {
            acc[tag.name] = tag;
            return acc;
        }, {});
    }

    async findMultiple(tags: string[]): Promise<Record<string, Tag>> {
        const results = await this.tagRepository.find({
            where: {
                name: In(tags),
            },
        });
        return results.reduce((acc, tag) => {
            acc[tag.name] = tag;
            return acc;
        }, {});
    }

    async findOrCreateMultipleTags(tags: string[]): Promise<Tag[]> {
        const exitsTags = await this.findMultiple(tags);
        const newTags = tags.filter((tag) => !exitsTags[tag]);
        const results = await this.tagRepository.save(newTags.map((tag) => ({ name: tag })));
        return [...results, ...Object.values(exitsTags)];
    }
}
