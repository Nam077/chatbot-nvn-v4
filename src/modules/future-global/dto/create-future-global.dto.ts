import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateFutureGlobalDto {
    // have Sender PSID
    @ApiProperty({
        example: '123456789',
        description: 'Sender PSID',
    })
    @IsNotEmpty()
    @IsString()
    senderPsid: string;
}
