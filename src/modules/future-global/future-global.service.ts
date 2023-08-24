import { Injectable } from '@nestjs/common';
import { CreateFutureGlobalDto } from './dto/create-future-global.dto';
import { UpdateFutureGlobalDto } from './dto/update-future-global.dto';
import { FutureGlobal } from './entities/future-global.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseLocal } from '../../interfaces/response-local';

@Injectable()
export class FutureGlobalService {
    constructor(
        @InjectRepository(FutureGlobal, 'chat-bot')
        private readonly futureGlobalRepository: Repository<FutureGlobal>,
    ) {}

    async checkIsFutureGlobalExist(senderPsid: string): Promise<FutureGlobal> {
        return await this.futureGlobalRepository.findOne({ where: { senderPsid } });
    }

    async create(createFutureGlobalDto: CreateFutureGlobalDto): Promise<ResponseLocal<FutureGlobal>> {
        const { senderPsid } = createFutureGlobalDto;
        const isFutureGlobalExist = await this.checkIsFutureGlobalExist(senderPsid);
        if (isFutureGlobalExist) {
            return {
                data: null,
                message: 'FutureGlobal is already exist',
                isSuccess: false,
            };
        }
        const futureGlobal = this.futureGlobalRepository.create(createFutureGlobalDto);
        await this.futureGlobalRepository.save(futureGlobal);
        return {
            data: futureGlobal,
            message: 'Create FutureGlobal successfully',
            isSuccess: true,
        };
    }

    async findAll(): Promise<FutureGlobal[]> {
        return await this.futureGlobalRepository.find();
    }

    async findOne(id: number): Promise<FutureGlobal> {
        return await this.futureGlobalRepository.findOne({ where: { id } });
    }

    async update(id: number, updateFutureGlobalDto: UpdateFutureGlobalDto) {
        const futureGlobal = await this.findOne(id);
        if (!futureGlobal) {
            return {
                data: null,
                message: 'FutureGlobal is not exist',
                isSuccess: false,
            };
        }
        const { senderPsid } = updateFutureGlobalDto;
        if (senderPsid !== futureGlobal.senderPsid && senderPsid) {
            const isFutureGlobalExist = await this.checkIsFutureGlobalExist(senderPsid);
            if (isFutureGlobalExist) {
                return {
                    data: null,
                    message: 'FutureGlobal is already exist',
                    isSuccess: false,
                };
            }
        }
        await this.futureGlobalRepository.update({ id }, updateFutureGlobalDto);
        return {
            data: await this.findOne(id),
            message: 'BotUpdate FutureGlobal successfully',
            isSuccess: true,
        };
    }

    async remove(id: number): Promise<FutureGlobal> {
        const futureGlobal = await this.findOne(id);
        if (!futureGlobal) {
            return null;
        }
        await this.futureGlobalRepository.delete({ id });
        return futureGlobal;
    }
    async removeBySenderPsid(senderPsid: string): Promise<ResponseLocal<FutureGlobal>> {
        const futureGlobal = await this.futureGlobalRepository.findOne({ where: { senderPsid } });
        if (!futureGlobal) {
            return {
                data: null,
                message: 'FutureGlobal is not exist',
                isSuccess: false,
            };
        }
        await this.futureGlobalRepository.delete({ senderPsid });
        return {
            data: futureGlobal,
            message: 'Remove FutureGlobal successfully',
            isSuccess: true,
        };
    }

    async changeStatus(senderPsid: string): Promise<ResponseLocal<FutureGlobal>> {
        const futureGlobal = await this.futureGlobalRepository.findOne({ where: { senderPsid } });
        if (!futureGlobal) {
            return {
                data: null,
                message: 'FutureGlobal is not exist',
                isSuccess: false,
            };
        }
        await this.futureGlobalRepository.update({ senderPsid }, { status: !futureGlobal.status });
        return {
            data: await this.findOne(futureGlobal.id),
            message: 'Change status FutureGlobal successfully',
            isSuccess: true,
        };
    }

    async createByAdmin(senderPsid: string): Promise<ResponseLocal<FutureGlobal>> {
        const isFutureGlobalExist = await this.checkIsFutureGlobalExist(senderPsid);
        if (isFutureGlobalExist) {
            return {
                data: null,
                message: 'FutureGlobal is already exist',
                isSuccess: false,
            };
        }
        const futureGlobal = this.futureGlobalRepository.create({ senderPsid, status: true });
        await this.futureGlobalRepository.save(futureGlobal);
        return {
            data: futureGlobal,
            message: 'Create FutureGlobal successfully',
            isSuccess: true,
        };
    }

    async findOneBySenderPsid(senderPsidAdd: string): Promise<ResponseLocal<FutureGlobal>> {
        const futureGlobal = await this.futureGlobalRepository.findOne({ where: { senderPsid: senderPsidAdd } });
        if (!futureGlobal) {
            return {
                data: null,
                message: 'FutureGlobal is not exist',
                isSuccess: false,
            };
        }
        return {
            data: futureGlobal,
            message: 'Get FutureGlobal successfully',
            isSuccess: true,
        };
    }
}
