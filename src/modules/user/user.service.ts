import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from '../../utils/hash';
import { ResponseData } from '../../interfaces/response-data.interface';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User, 'chat-bot')
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        });
    }

    async checkExist(email: string, id?: number): Promise<boolean> {
        const user = await this.findByEmail(email);
        if (!user) {
            return false;
        }
        if (id) {
            return user.id !== id;
        }
        return true;
    }

    async create(createUserDto: CreateUserDto): Promise<ResponseData<User>> {
        const { email, name, role = 'user', password } = createUserDto;
        if (await this.checkExist(email)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Email already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const user = new User();
        user.email = email;
        user.name = name;
        user.role = role;
        user.password = await hash(password);
        const result: User = await this.userRepository.save(user);
        return {
            data: result,
            isSuccess: true,
            message: 'Create user successfully',
            statusCode: HttpStatus.CREATED,
        };
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findOne(id: number) {
        return this.userRepository.findOneBy({ id });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ResponseData<User>> {
        const user = await this.findOne(id);
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'User not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        if (updateUserDto.email) {
            if (await this.checkExist(updateUserDto.email, id)) {
                throw new HttpException(
                    {
                        status: HttpStatus.CONFLICT,
                        error: 'Email already exists',
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        if (updateUserDto.password) {
            updateUserDto.password = await hash(updateUserDto.password);
        }
        await this.userRepository.update(id, updateUserDto);
        return {
            data: await this.findOne(id),
            isSuccess: true,
            message: 'BotUpdate user successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'User not found',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        await this.userRepository.delete(id);
        return {
            isSuccess: true,
            message: 'Delete user successfully',
            statusCode: HttpStatus.OK,
        };
    }

    async setCurrentRefreshToken(refreshToken: string, id: number) {
        await this.userRepository.update(id, {
            refreshToken: refreshToken,
        });
    }

    async register(registerDto: RegisterDto) {
        const { email, name, password } = registerDto;
        if (await this.checkExist(email)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Email already exists',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const user = new User();
        user.email = email;
        user.name = name;
        user.password = await hash(password);
        const result: User = await this.userRepository.save(user);
        return {
            data: result,
            isSuccess: true,
            message: 'Register successfully',
            statusCode: HttpStatus.CREATED,
        };
    }
}
