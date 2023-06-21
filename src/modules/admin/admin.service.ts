import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { ResponseLocal } from '../../interfaces/response-local';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ) {}

    async findOneBySenderPsid(senderPsid: string) {
        return await this.adminRepository.findOneBy({ senderPsid });
    }

    async checkExistBySenderPsid(senderPsid: string, id?: number) {
        const admin = await this.findOneBySenderPsid(senderPsid);
        if (!admin) {
            return false;
        }
        if (id) {
            return admin.id !== id;
        }
        return true;
    }

    async create(createAdminDto: CreateAdminDto) {
        const { senderPsid, name } = createAdminDto;
        if (await this.checkExistBySenderPsid(senderPsid)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Sender PSID already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const admin = new Admin();
        admin.senderPsid = senderPsid;
        admin.name = name;
        const result: Admin = await this.adminRepository.save(admin);
        return {
            data: result,
            isSuccess: true,
            message: 'Create admin successfully',
            statusCode: HttpStatus.CREATED,
        };
    }

    async findAll() {
        return this.adminRepository.find();
    }

    async findOne(id: number) {
        return this.adminRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateAdminDto: UpdateAdminDto) {
        const admin = await this.findOne(id);
        if (!admin) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Admin not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateAdminDto.senderPsid) {
            if (await this.checkExistBySenderPsid(updateAdminDto.senderPsid, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: 'Sender PSID already exists',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        await this.adminRepository.update(id, updateAdminDto);
        return {
            isSuccess: true,
            message: 'Update admin successfully',
            statusCode: HttpStatus.OK,
            data: await this.findOne(id),
        };
    }

    async findAllGetString(chunkSize = 10): Promise<string[]> {
        const admins = await this.findAll();
        const result: string[] = [];

        for (let i = 0; i < admins.length; i += chunkSize) {
            let str = '';

            for (let j = i; j < i + chunkSize && j < admins.length; j++) {
                const admin = admins[j];
                str += `${admin.name} - ${admin.senderPsid}\n\n`;
            }

            result.push(str);
        }

        return result;
    }

    async remove(id: number) {
        const admin = await this.findOne(id);
        if (!admin) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Admin not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.adminRepository.delete(id);
        return {
            isSuccess: true,
            message: 'Delete admin successfully',
            statusCode: HttpStatus.OK,
        };
    }
    async removeBySenderPsid(senderPsid: string) {
        const admin = await this.findOneBySenderPsid(senderPsid);
        if (!admin) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Admin not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.adminRepository.delete(admin.id);
        return {
            isSuccess: true,
            message: 'Delete admin successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async removeAll() {
        await this.adminRepository.clear();
        return {
            isSuccess: true,
            message: 'Delete all admin successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async findAllAdminsSenderPsid(): Promise<string[]> {
        const admins: Admin[] = await this.findAll();
        return admins.map((admin: Admin) => admin.senderPsid);
    }

    async checkIsAdmin(senderPsid: string) {
        const admin = await this.findOneBySenderPsid(senderPsid);
        return !!admin;
    }

    async addAdmin(senderPsid: string): Promise<ResponseLocal<Admin>> {
        const admin = await this.findOneBySenderPsid(senderPsid);
        if (admin) {
            return {
                isSuccess: false,
                message: 'User already is admin',
            };
        }
        const newAdmin = new Admin();
        newAdmin.senderPsid = senderPsid;
        const result: Admin = await this.adminRepository.save(newAdmin);
        return {
            isSuccess: true,
            message: 'Add admin successfully',
            data: result,
        };
    }

    async removeAdmin(senderPsid: string) {
        const admin = await this.findOneBySenderPsid(senderPsid);
        if (!admin) {
            return {
                isSuccess: false,
                message: 'User is not admin',
            };
        }
        await this.adminRepository.delete(admin.id);
        return {
            isSuccess: true,
            message: 'Remove admin successfully',
        };
    }

    async findAllChunk(chunk = 20): Promise<Admin[][]> {
        const admins = await this.findAll();
        const result: Admin[][] = [];
        for (let i = 0; i < admins.length; i += chunk) {
            result.push(admins.slice(i, i + chunk));
        }
        return result;
    }

    async getAdminList(chunk = 20): Promise<string[][]> {
        const admins = await this.findAll();
        const result: string[][] = [];
        for (let i = 0; i < admins.length; i += chunk) {
            const adminChunk = admins.slice(i, i + chunk);
            const adminChunkString = adminChunk.map((admin) => {
                return `${admin.name} - ${admin.senderPsid}`;
            });
            result.push(adminChunkString);
        }
        return result;
    }
}
