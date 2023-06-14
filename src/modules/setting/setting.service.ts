import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseData } from '../../interfaces/response-data.interface';

type SettingType = 'string' | 'number' | 'boolean';

@Injectable()
export class SettingService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,
    ) {}

    async findOneByKey(key: string) {
        return await this.settingRepository.findOneBy({ key });
    }

    async checkKeyExists(key: string, id?: number) {
        const setting = await this.findOneByKey(key);
        if (!setting) {
            return false;
        }
        if (id) {
            return setting.id !== id;
        }
        return true;
    }

    async create(createSettingDto: CreateSettingDto): Promise<ResponseData<Setting>> {
        const { key, value, description = `This is ${key} setting` } = createSettingDto;
        if (await this.checkKeyExists(key)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Key already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const setting = new Setting();
        setting.key = key;
        setting.value = value;
        setting.description = description;
        const result: Setting = await this.settingRepository.save(setting);
        return {
            data: result,
            isSuccess: true,
            message: 'Create setting successfully',
            statusCode: HttpStatus.CREATED,
        };
    }

    async findAll(): Promise<Setting[]> {
        return await this.settingRepository.find();
    }

    async findOne(id: number) {
        return await this.settingRepository.findOneBy({ id });
    }

    async update(id: number, updateSettingDto: UpdateSettingDto) {
        const setting = await this.findOne(id);
        if (!setting) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Setting not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateSettingDto.key && (await this.checkKeyExists(updateSettingDto.key, id))) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Key already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const result: Setting = await this.settingRepository.save({
            ...setting,
            ...updateSettingDto,
        });
        return {
            data: result,
            isSuccess: true,
            message: 'Update setting successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async remove(id: number) {
        const setting = await this.findOne(id);
        if (!setting) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Setting not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.settingRepository.remove(setting);
        return {
            isSuccess: true,
            message: 'Delete setting successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async getValuesByKey(key: string, type: SettingType, defaultValue?: string): Promise<string | number | boolean> {
        let setting = await this.findOneByKey(key);
        if (!setting) {
            if (defaultValue) {
                setting = await this.createKey(key, type, defaultValue);
            } else {
                setting = await this.createKey(key, type);
            }
        }
        switch (type) {
            case 'string':
                return setting.value || '';
            case 'number':
                return Number(setting.value) || 0;
            case 'boolean':
                return Boolean(setting.value) || false;
            default:
                return setting.value;
        }
    }

    async createKey(key: string, type: SettingType, value?: string) {
        if (await this.checkKeyExists(key)) {
            return this.findOneByKey(key);
        }
        const setting = new Setting();
        setting.key = key;
        switch (type) {
            case 'string':
                setting.value = value ?? ' ';
                break;
            case 'number':
                setting.value = value ?? '0';
                break;
            case 'boolean':
                setting.value = value ?? 'false';
                break;
            default:
                setting.value = value ?? '';
        }
        setting.description = `This is ${key} setting`;
        return await this.settingRepository.save(setting);
    }

    async getPageAccessTokens(): Promise<string> {
        return (await this.getValuesByKey('PAGE_ACCESS_TOKEN', 'string')) as string;
    }
    async getApiVersion(defaultValue?: string): Promise<string> {
        if (defaultValue) {
            return (await this.getValuesByKey('API_VERSION', 'string', defaultValue)) as string;
        }
        return (await this.getValuesByKey('API_VERSION', 'string')) as string;
    }
    async updatePageAccessToken(value: string): Promise<Setting> {
        return await this.settingRepository.save({
            ...(await this.findOneByKey('PAGE_ACCESS_TOKEN')),
            value,
        });
    } //
}
