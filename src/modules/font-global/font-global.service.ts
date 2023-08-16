import { Injectable } from '@nestjs/common';
import { CreateFontGlobalDto } from './dto/create-font-global.dto';
import { UpdateFontGlobalDto } from './dto/update-font-global.dto';
import { FontGlobal } from './entities/font-global.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from '../../interfaces/response-data.interface';

@Injectable()
export class FontGlobalService {
    constructor(
        @InjectRepository(FontGlobal, 'font-global')
        private readonly fontGlobalRepository: Repository<FontGlobal>,
    ) {}

    async findBySlug(slug: string) {
        return await this.fontGlobalRepository.findOne({
            where: {
                slug: slug,
            },
        });
    }

    async create(createFontGlobalDto: CreateFontGlobalDto): Promise<ResponseData<FontGlobal>> {
        return {
            data: await this.fontGlobalRepository.save(createFontGlobalDto),
            isSuccess: true,
            message: 'Font created successfully',
            statusCode: 201,
        };
    }

    async findAll() {
        return await this.fontGlobalRepository.find({
            order: {
                id: 'ASC',
            },
        });
    }

    async findOne(id: number): Promise<FontGlobal> {
        return await this.fontGlobalRepository.findOne({ where: { id: id } });
    }

    async getFontLatest() {
        return await this.fontGlobalRepository.createQueryBuilder('fonts').orderBy('fonts.id', 'DESC').getOne();
    }

    update(id: number, updateFontGlobalDto: UpdateFontGlobalDto) {
        return `This action updates a #${id} fontGlobal`;
    }

    remove(id: number) {
        return `This action removes a #${id} fontGlobal`;
    }

    async search(keyword: string) {
        return await this.fontGlobalRepository
            .createQueryBuilder('fonts')
            .where('fonts.name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('fonts.categoryName LIKE :keyword', { keyword: `%${keyword}%` })
            .limit(10)
            .getMany();
    }

    async getRandomFonts(limit = 10, keyword = '') {
        return await this.fontGlobalRepository
            .createQueryBuilder('fonts')
            .where('fonts.name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('fonts.categoryName LIKE :keyword', { keyword: `%${keyword}%` })
            .orderBy('RANDOM()')
            .limit(limit)
            .getMany();
    }
}
