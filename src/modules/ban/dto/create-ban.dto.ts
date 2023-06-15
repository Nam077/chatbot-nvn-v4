import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBanDto {
    @ApiProperty({ example: '20357230958723095', description: 'The SenderPsid of user ban' })
    @IsNotEmpty({
        message: 'SenderPsid is required',
    })
    @IsString({
        message: 'SenderPsid must be string',
    })
    senderPsid: string;

    @ApiProperty({ example: 'admin', description: 'The name of user ban' })
    @IsNotEmpty({
        message: 'Name is required',
    })
    @IsString({
        message: 'Name must be string',
    })
    name: string;

    @ApiProperty({ example: 'admin', description: 'The reason of user ban' })
    @IsOptional()
    @IsString({
        message: 'Reason must be string',
    })
    reason: string;
}
