import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';

export class VerificationResendEmailRequestDto {
    @ApiProperty({
        required: true,
        example: faker.internet.email(),
    })
    @IsString()
    @IsNotEmpty()
    email: string;
}
