import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFontDto } from './dto/create-font.dto';
import { UpdateFontDto } from './dto/update-font.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Font, FontStatus } from './entities/font.entity';
import { KeyService } from '../key/key.service';
import { TagService } from '../tag/tag.service';
import { MessageService } from '../message/message.service';
import { LinkService } from '../link/link.service';
import { ImageService } from '../image/image.service';
import { slugifyString } from '../../utils/string';

@Injectable()
export class FontService {
    constructor(
        @InjectRepository(Font, 'chat-bot')
        private readonly fontRepository: Repository<Font>,
        private readonly tagService: TagService,
        private readonly messageService: MessageService,
        private readonly keyService: KeyService,
        private readonly imageService: ImageService,
        private readonly linkService: LinkService,
    ) {}

    async findFontBySlug(slug: string): Promise<Font> {
        return this.fontRepository.findOne({ where: { slug } });
    }

    async checkExistBySlug(slug: string, id?: number): Promise<boolean> {
        const font = await this.findFontBySlug(slug);
        if (!font) {
            return false;
        }
        if (id) {
            return font.id !== id;
        }
        return true;
    }

    async create(createFontDto: CreateFontDto) {
        const {
            name,
            urlPost,
            description = `${name} là một font chữ đẹp`,
            keys = [],
            images = [],
            messages = [],
            tags = [],
            links = [],
        } = createFontDto;
        const keysCreated = await this.keyService.findOrCreateMultipleKeys(keys, 'font');
        const imagesCreated = await this.imageService.findOrCreateMultipleImages(images);
        const messagesCreated = await this.messageService.findOrCreateMultipleMessages(messages);
        const tagsCreated = await this.tagService.findOrCreateMultipleTags(tags);
        const linksCreated = await this.linkService.findOrCreateMultipleLinks(links);
        if (await this.checkExistBySlug(slugifyString(name))) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Font already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        const font = this.fontRepository.create({
            name,
            urlPost,
            description,
            keys: keysCreated,
            images: imagesCreated,
            messages: messagesCreated,
            tags: tagsCreated,
            links: linksCreated,
            slug: slugifyString(name),
        });
        return await this.fontRepository.save(font);
    }

    async findAll() {
        return await this.fontRepository.find({
            relations: {
                keys: true,
                images: true,
                links: true,
                messages: true,
                tags: true,
            },
        });
    }

    async findOne(id: number) {
        return await this.fontRepository.findOne({
            where: { id },
            relations: {
                keys: true,
                images: true,
                links: true,
                messages: true,
                tags: true,
            },
        });
    }

    async update(id: number, updateFontDto: UpdateFontDto) {
        const font = await this.findOne(id);
        if (!font) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Font not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateFontDto.name) {
            if (await this.checkExistBySlug(slugifyString(updateFontDto.name), id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Font already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
            font.name = updateFontDto.name;
            font.slug = slugifyString(updateFontDto.name);
        }
        if (updateFontDto.keys) {
            font.keys = await this.keyService.findOrCreateMultipleKeys(updateFontDto.keys, 'font', id);
        }
        if (updateFontDto.images) {
            font.images = await this.imageService.findOrCreateMultipleImages(updateFontDto.images);
        }
        if (updateFontDto.links) {
            font.links = await this.linkService.findOrCreateMultipleLinks(updateFontDto.links);
        }
        if (updateFontDto.messages) {
            font.messages = await this.messageService.findOrCreateMultipleMessages(updateFontDto.messages);
        }
        if (updateFontDto.tags) {
            font.tags = await this.tagService.findOrCreateMultipleTags(updateFontDto.tags);
        }
        if (updateFontDto.urlPost) {
            font.urlPost = updateFontDto.urlPost;
        }
        await this.fontRepository.save(font);
        return font;
    }

    async updateStatus(id: number): Promise<{ isSuccess: boolean; font: Font }> {
        const font = await this.findOne(id);
        if (!font) {
            return {
                isSuccess: false,
                font: null,
            };
        }
        font.status = font.status === FontStatus.ACTIVE ? FontStatus.INACTIVE : FontStatus.ACTIVE;
        try {
            const updateFont = await this.fontRepository.save(font);
            return {
                isSuccess: true,
                font: updateFont,
            };
        } catch (e) {
            return {
                isSuccess: false,
                font: null,
            };
        }
    }

    async remove(id: number) {
        const font = await this.findOne(id);
        if (!font) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Font not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.fontRepository.remove(font);
        return font;
    }

    async createMultiple(fonts: any[], removeOld = false): Promise<Record<string, Font>> {
        if (removeOld) {
            await this.fontRepository.clear();
        }
        const savedFonts: Font[] = await this.fontRepository.save(fonts);
        return savedFonts.reduce((acc, font) => ({ ...acc, [font.name]: font }), {});
    }

    async findChunk(chunkSize = 20): Promise<Font[][]> {
        const fonts = await this.findAll();
        const chunkedFonts: Font[][] = [];
        for (let i = 0; i < fonts.length; i += chunkSize) {
            chunkedFonts.push(fonts.slice(i, i + chunkSize));
        }
        return chunkedFonts;
    }

    async findChunkGetString(chunkSize = 50): Promise<string[][]> {
        const chunkedFonts = await this.findChunk(chunkSize);
        return chunkedFonts.map((chunk) => chunk.map((font) => font.name));
    }
}
