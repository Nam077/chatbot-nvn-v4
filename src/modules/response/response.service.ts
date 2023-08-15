import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './entities/response.entity';
import { TagService } from '../tag/tag.service';
import { MessageService } from '../message/message.service';
import { KeyService } from '../key/key.service';
import { ImageService } from '../image/image.service';
import { LinkService } from '../link/link.service';

@Injectable()
export class ResponseService {
    constructor(
        @InjectRepository(Response, 'chat-bot')
        private readonly responseRepository: Repository<Response>,
        private readonly tagService: TagService,
        private readonly messageService: MessageService,
        private readonly keyService: KeyService,
        private readonly imageService: ImageService,
        private readonly linkService: LinkService,
    ) {}

    async findResponseByName(name: string): Promise<Response> {
        return this.responseRepository.findOneBy({ name });
    }

    async checkExistByName(name: string, id?: number): Promise<boolean> {
        const response = await this.findResponseByName(name);
        if (!response) {
            return false;
        }
        if (id) {
            return response.id !== id;
        }
        return true;
    }

    async create(createResponseDto: CreateResponseDto) {
        const { name, keys = [], messages = [], images = [] } = createResponseDto;
        if (await this.checkExistByName(name)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Response already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        const keysCreated = await this.keyService.findOrCreateMultipleKeys(keys, 'response');
        const messagesCreated = await this.messageService.findOrCreateMultipleMessages(messages);
        const imagesCreated = await this.imageService.findOrCreateMultipleImages(images);
        const response = await this.responseRepository.create({
            ...createResponseDto,
            keys: keysCreated,
            messages: messagesCreated,
            images: imagesCreated,
        });
        return await this.responseRepository.save(response);
    }

    async findAll() {
        return await this.responseRepository.find();
    }

    async findOne(id: number) {
        return this.responseRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateResponseDto: UpdateResponseDto) {
        const { name } = updateResponseDto;
        const response = await this.findOne(id);
        if (!response) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Response not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateResponseDto.name) {
            if (await this.checkExistByName(name, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Response already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        if (updateResponseDto.keys) {
            response.keys = await this.keyService.findOrCreateMultipleKeys(updateResponseDto.keys, 'response', id);
        }
        if (updateResponseDto.messages) {
            response.messages = await this.messageService.findOrCreateMultipleMessages(updateResponseDto.messages);
        }
        if (updateResponseDto.images) {
            response.images = await this.imageService.findOrCreateMultipleImages(updateResponseDto.images);
        }
        return await this.responseRepository.save(response);
    }

    async remove(id: number) {
        const response = await this.findOne(id);
        if (!response) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Response not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return this.responseRepository.remove(response);
    }

    async createMultiple(responses: any[], removeOld = false): Promise<Record<string, Response>> {
        if (removeOld) {
            await this.responseRepository.clear();
        }
        const savedResponses: Response[] = await this.responseRepository.save(responses);
        return savedResponses.reduce((acc, response) => ({ ...acc, [response.name]: response }), {});
    }
}
