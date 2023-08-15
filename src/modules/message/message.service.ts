import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message, 'chat-bot')
        private readonly messageRepository: Repository<Message>,
    ) {}

    async findMessageByValue(value: string): Promise<Message> {
        return this.messageRepository.findOneBy({ value });
    }

    async checkExistByValue(value: string, id?: number): Promise<boolean> {
        const message = await this.findMessageByValue(value);
        if (!message) {
            return false;
        }
        if (id) {
            return message.id !== id;
        }
        return true;
    }

    async create(createMessageDto: CreateMessageDto) {
        const { value } = createMessageDto;
        if (await this.checkExistByValue(value)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Message already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        return await this.messageRepository.save(createMessageDto);
    }

    async findAll() {
        return await this.messageRepository.find();
    }

    async findOne(id: number) {
        return this.messageRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateMessageDto: UpdateMessageDto) {
        const { value } = updateMessageDto;
        if (updateMessageDto.value) {
            if (await this.checkExistByValue(value, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Message already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        return this.messageRepository.update(id, updateMessageDto);
    }

    async remove(id: number) {
        return this.messageRepository.delete(id);
    }

    async createMultiple(messages: CreateMessageDto[], removeOld = false): Promise<Record<string, Message>> {
        const newMessages: Message[] = messages.map((message) => this.messageRepository.create(message));
        if (removeOld) {
            await this.messageRepository.clear();
        }
        const savedMessages: Message[] = await this.messageRepository.save(newMessages);
        return savedMessages.reduce((acc, message) => ({ ...acc, [message.value]: message }), {});
    }

    async findMessagesByValues(values: string[]): Promise<Record<string, Message>> {
        const messages: Message[] = await this.messageRepository.find({
            where: { value: In(values) },
        });
        return messages.reduce((acc, message) => ({ ...acc, [message.value]: message }), {});
    }

    async findOrCreateMultipleMessages(values: string[]): Promise<Message[]> {
        const existMessages: Record<string, Message> = await this.findMessagesByValues(values);
        const newMessages: CreateMessageDto[] = values
            .filter((value) => !existMessages[value])
            .map((value) => ({ value }));
        const savedMessages: Message[] = await this.messageRepository.save(newMessages);
        return [...Object.values(existMessages), ...savedMessages];
    }
}
