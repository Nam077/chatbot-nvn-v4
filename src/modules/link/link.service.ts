import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(Link)
        private readonly linkRepository: Repository<Link>,
    ) {}

    async findLinkByUrl(url: string): Promise<Link> {
        return this.linkRepository.findOneBy({ url });
    }

    async checkExistByUrl(url: string, id?: number): Promise<boolean> {
        const link = await this.findLinkByUrl(url);
        if (!link) {
            return false;
        }
        if (id) {
            return link.id !== id;
        }
        return true;
    }
    async create(createLinkDto: CreateLinkDto) {
        const { url } = createLinkDto;
        if (await this.checkExistByUrl(url)) {
            throw new HttpException(
                {
                    status: HttpStatus.CONFLICT,
                    error: 'Link already exists',
                },
                HttpStatus.CONFLICT,
            );
        }
        return await this.linkRepository.save(createLinkDto);
    }

    async findAll() {
        return await this.linkRepository.find();
    }

    async findOne(id: number) {
        return this.linkRepository.findOne({
            where: { id },
        });
    }

    async update(id: number, updateLinkDto: UpdateLinkDto) {
        const { url } = updateLinkDto;
        if (updateLinkDto.url) {
            if (await this.checkExistByUrl(url, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Link already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }
        return this.linkRepository.update(id, updateLinkDto);
    }

    async remove(id: number) {
        const link = await this.findOne(id);
        if (!link) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Link not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return this.linkRepository.delete(id);
    }

    async createMultiple(links: CreateLinkDto[], removeOld = false): Promise<Record<string, Link>> {
        const newLinks: Link[] = links.map((link) => this.linkRepository.create(link));
        if (removeOld) {
            await this.linkRepository.clear();
        }
        const savedLinks: Link[] = await this.linkRepository.save(newLinks);
        return savedLinks.reduce((acc, link) => ({ ...acc, [link.url]: link }), {});
    }

    async findLinksByUrls(urls: string[]): Promise<Record<string, Link>> {
        const links: Link[] = await this.linkRepository.find({
            where: {
                url: In(urls),
            },
        });
        return links.reduce((acc, link) => ({ ...acc, [link.url]: link }), {});
    }

    async findOrCreateMultipleLinks(urls: string[]): Promise<Link[]> {
        const links: Link[] = await this.linkRepository.find({
            where: {
                url: In(urls),
            },
        });
        const newUrls: string[] = urls.filter((url) => !links[url]);
        const savedLinks: Link[] = await this.linkRepository.save(newUrls.map((url) => ({ url })));
        return [...links, ...savedLinks];
    }
}
