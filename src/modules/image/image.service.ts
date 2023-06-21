import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
    ) {}

    async findImageByUrl(url: string): Promise<Image> {
        return this.imageRepository.findOneBy({ url });
    }

    async checkExistByUrl(url: string, id?: number): Promise<boolean> {
        const image = await this.findImageByUrl(url);
        if (!image) {
            return false;
        }
        if (id) {
            return image.id !== id;
        }
        return true;
    }
    async create(createImageDto: CreateImageDto) {
        const { url } = createImageDto;
        if (await this.checkExistByUrl(url)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Image already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        return await this.imageRepository.save(createImageDto);
    }

    async findAll() {
        return await this.imageRepository.find();
    }

    async findOne(id: number) {
        return this.imageRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateImageDto: UpdateImageDto) {
        const { url } = updateImageDto;
        if (updateImageDto.url) {
            if (await this.checkExistByUrl(url, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Image already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        return await this.imageRepository.update(id, updateImageDto);
    }

    async remove(id: number) {
        const image = await this.findOne(id);
        if (!image) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Image not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return await this.imageRepository.remove(image);
    }

    async createMultiple(images: CreateImageDto[], deleteOld = false): Promise<Record<string, Image>> {
        if (deleteOld) {
            await this.imageRepository.clear();
        }
        const results = await this.imageRepository.save(images);
        return results.reduce((acc, image) => {
            acc[image.url] = image;
            return acc;
        }, {});
    }

    async findImagesByUrls(urls: string[]): Promise<Record<string, Image>> {
        const images = await this.imageRepository.find({
            where: {
                url: In(urls),
            },
        });
        return images.reduce((acc, image) => {
            acc[image.url] = image;
            return acc;
        }, {});
    }
    async findOrCreateMultipleImages(images: string[]): Promise<Image[]> {
        const existImages = await this.findImagesByUrls(images);
        const newImages = images.filter((image) => !existImages[image]);
        const createdImages = await this.imageRepository.save(newImages.map((image) => ({ url: image })));
        return [...createdImages, ...Object.values(existImages)];
    }
}
