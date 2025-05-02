import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LocationRequestDto {
    @ApiProperty({
        example: faker.location.city(),
        required: true,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    location: string;
}
