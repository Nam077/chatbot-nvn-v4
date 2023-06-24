import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { Ban } from './entities/ban.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseLocal } from '../../interfaces/response-local';

@Injectable()
export class BanService {
    constructor(
        @InjectRepository(Ban)
        private readonly banRepository: Repository<Ban>,
    ) {}

    async findOneBySenderPsid(senderPsid: string) {
        return await this.banRepository.findOneBy({ senderPsid });
    }

    async checkExistBySenderPsid(senderPsid: string, id?: number) {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return false;
        }
        if (id) {
            return ban.id !== id;
        }
        return true;
    }

    async create(createBanDto: CreateBanDto) {
        const { senderPsid, name, reason = 'Người dùng vi phạm chính sách của trang' } = createBanDto;
        if (await this.checkExistBySenderPsid(senderPsid)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Sender PSID already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const ban = new Ban();
        ban.senderPsid = senderPsid;
        ban.name = name;
        ban.reason = reason;
        const result: Ban = await this.banRepository.save(ban);
        return {
            data: result,
            isSuccess: true,
            message: 'Create ban successfully',
            statusCode: HttpStatus.CREATED,
        };
    }

    async findAll() {
        return this.banRepository.find();
    }

    async findOne(id: number) {
        return this.banRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateBanDto: UpdateBanDto) {
        const ban = await this.findOne(id);
        if (!ban) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Ban not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateBanDto.senderPsid) {
            if (await this.checkExistBySenderPsid(updateBanDto.senderPsid, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: 'Sender PSID already exists',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        await this.banRepository.update(id, updateBanDto);
        return {
            isSuccess: true,
            message: 'Update ban successfully',
            statusCode: HttpStatus.OK,
            data: await this.findOne(id),
        };
    }

    async remove(id: number) {
        const ban = await this.findOne(id);
        if (!ban) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Ban not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.banRepository.delete(id);
        return {
            isSuccess: true,
            message: 'Delete ban successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async checkBan(senderPsid: string) {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return false;
        }
        return true;
    }

    async removeBySenderPsid(senderPsid: string) {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Ban not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.banRepository.delete(ban.id);
        return {
            isSuccess: true,
            message: 'Delete ban successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async unban(senderPsid: string): Promise<ResponseLocal<Ban>> {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return {
                isSuccess: false,
                message: 'Ban not found',
            };
        }
        await this.banRepository.delete(ban.id);
        return {
            isSuccess: true,
            message: 'Unban successfully',
            data: ban,
        };
    }

    async unbanAll(): Promise<ResponseLocal<Ban>> {
        await this.banRepository.clear();
        return {
            isSuccess: true,
            message: 'Unban all successfully',
        };
    }

    async checkIsBanned(senderPsid: string): Promise<ResponseLocal<Ban>> {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return {
                isSuccess: false,
                message: 'User is not banned',
            };
        }
        return {
            isSuccess: true,
            message: 'User is banned',
            data: ban,
        };
    }

    async getBanList(chunk = 20): Promise<string[][]> {
        const bans = await this.findAll();
        if (!bans.length) {
            return [['Không có người dùng nào bị cấm']];
        }
        const banList = [];
        for (let i = 0; i < bans.length; i += chunk) {
            const currentChunk = bans.slice(i, i + chunk);
            const banInfo = currentChunk.map(
                (ban) => `Tên: ${ban.name}\nPSID: ${ban.senderPsid}\nLý do: ${ban.reason}`,
            );

            banList.push(banInfo);
        }
        return banList;
    }

    async ban(createBanDto: CreateBanDto): Promise<ResponseLocal<Ban>> {
        const { senderPsid, name, reason = 'Người dùng vi phạm chính sách của trang' } = createBanDto;
        if (await this.checkExistBySenderPsid(senderPsid)) {
            return {
                isSuccess: false,
                message: 'Sender PSID already exists',
            };
        }
        const ban = new Ban();
        ban.senderPsid = senderPsid;
        ban.name = name;
        ban.reason = reason;
        const result: Ban = await this.banRepository.save(ban);
        return {
            isSuccess: true,
            message: 'Ban successfully',
            data: result,
        };
    }

    async updateBanNameBySenderPsid(senderPsid: string, name: string) {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return {
                isSuccess: false,
                message: 'Ban not found',
            };
        }
        await this.banRepository.update(ban.id, { name });
        return {
            isSuccess: true,
            message: 'Update ban name successfully',
            data: await this.findOne(ban.id),
        };
    }

    async deleteBySenderPsid(senderPsid) {
        const ban = await this.findOneBySenderPsid(senderPsid);
        if (!ban) {
            return {
                isSuccess: false,
                message: 'Ban not found',
            };
        }
        await this.banRepository.delete(ban.id);
        return {
            isSuccess: true,
            message: 'Delete ban successfully',
        };
    }
}
