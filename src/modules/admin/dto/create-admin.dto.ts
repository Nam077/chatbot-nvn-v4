import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
    @ApiProperty({ example: '20357230958723095', description: 'The SenderPsid of admin' })
    @IsNotEmpty({
        message: 'SenderPsid is required',
    })
    @IsString({
        message: 'SenderPsid must be string',
    })
    senderPsid: string;

    @ApiProperty({ example: 'admin', description: 'The name of admin' })
    @IsNotEmpty({
        message: 'Name is required',
    })
    @IsString({
        message: 'Name must be string',
    })
    name: string;
}
