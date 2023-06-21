import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSheet, GoogleSheetService } from './google-sheet/google-sheet.service';
import { KeyService } from '../key/key.service';
import { MessageService } from '../message/message.service';
import { LinkService } from '../link/link.service';
import { FontService } from '../font/font.service';
import { ResponseService } from '../response/response.service';
import { Key } from '../key/entities/key.entity';
import { TagService } from '../tag/tag.service';
import { ImageService } from '../image/image.service';
import { Link } from '../link/entities/link.entity';
import { Message } from '../message/entities/message.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Image } from '../image/entities/image.entity';
import { CrawlerService } from './crawler/crawler.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BanService } from '../ban/ban.service';

@Injectable()
export class ChatService {
    constructor(
        private readonly googleSheetService: GoogleSheetService,
        private readonly keyService: KeyService,
        private readonly messageService: MessageService,
        private readonly linkService: LinkService,
        private readonly responseService: ResponseService,
        private readonly fontService: FontService,
        private readonly tagService: TagService,
        private readonly imageService: ImageService,
        private readonly crawlerService: CrawlerService,
        private readonly banService: BanService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async updateDataFromGoogleSheet() {
        try {
            const data: DataSheet = await this.googleSheetService.getData();
            const { keys, images, links, tags, messages, responses, fonts } = data;
            const keyRecord: Record<string, Key> = await this.keyService.createMultiple(keys, true);
            const linkRecord: Record<string, Link> = await this.linkService.createMultiple(links, true);
            const messageRecord: Record<string, Message> = await this.messageService.createMultiple(messages, true);
            const tagRecord: Record<string, Tag> = await this.tagService.createMultiple(tags, true);
            const imageRecord: Record<string, Image> = await this.imageService.createMultiple(images, true);
            const createFontDtos = fonts.map((font) => {
                const { name, urlPost, description, keys, messages, images, tags, links } = font;
                const keyFont = keys.map((key) => keyRecord[key.value]);
                const messageFont = messages.map((message) => messageRecord[message.value]);
                const imageFont = images.map((image) => imageRecord[image.url]);
                const tagFont = tags.map((tag) => tagRecord[tag.name]);
                const linkFont = links.map((link) => linkRecord[link.url]);

                return {
                    name,
                    urlPost,
                    description,
                    keys: keyFont,
                    messages: messageFont,
                    images: imageFont,
                    tags: tagFont,
                    links: linkFont,
                    slug: name,
                };
            });
            const responseCreateDtos = responses.map((response) => {
                const { name, keys, images, tags, messages, links } = response;
                const keyResponse = keys.map((key) => keyRecord[key.value]);
                const messageResponse = messages.map((message) => messageRecord[message.value]);
                const imageResponse = images.map((image) => imageRecord[image.url]);
                const tagResponse = tags.map((tag) => tagRecord[tag.name]);
                const linkResponse = links.map((link) => linkRecord[link.url]);
                return {
                    name: name,
                    keys: keyResponse,
                    messages: messageResponse,
                    images: imageResponse,
                    tags: tagResponse,
                    links: linkResponse,
                };
            });
            await this.fontService.createMultiple(createFontDtos, true);
            await this.responseService.createMultiple(responseCreateDtos, true);
            await this.updateKeyCache();
            await this.updateFontChunkCache();
            return 'Update data successfully!';
        } catch (e) {
            throw new HttpException('Có lỗi xảy ra', HttpStatus.BAD_REQUEST);
        }
    }

    async crawlerFromGoogleSearch(key: string) {
        return await this.crawlerService.crawlerFromGoogleSearch(key);
    }

    async getKeys() {
        const keys = await this.cacheManager.get('keys');
        if (keys) {
            return keys;
        }
        return await this.updateKeyCache();
    }

    async getFontChunk() {
        const fontChunk = await this.cacheManager.get('fontChunk');
        if (fontChunk) {
            return fontChunk;
        }
        return await this.updateFontChunkCache();
    }

    async updateFontChunkCache() {
        const fontChunkFromDb = await this.fontService.findChunkGetString();
        await this.cacheManager.set('fontChunk', fontChunkFromDb, 100000);
        return fontChunkFromDb;
    }

    async updateKeyCache() {
        const keysFromDb = await this.keyService.findAll();
        await this.cacheManager.set('keys', keysFromDb, 100000);
        return keysFromDb;
    }

    async getBanner() {
        return await this.banService.getBanList();
    }
}
